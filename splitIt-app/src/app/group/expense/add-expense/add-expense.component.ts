import {
  Component, Directive, ElementRef, EventEmitter, Input, Output, OnDestroy,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/expense.model';
import { ExpenseService } from 'src/app/expense.service';
import { GroupService } from 'src/app/group.service';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { AnimationOptions } from 'ngx-lottie';

type SplitType = 'equal' | 'unequal' | 'shares' | 'percentages';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.css'],
})
export class AddExpenseComponent {
  // ----- card flow -----
  /** 0 Name · 1 Amount · 2 Payer · 3 Split · 4 Details · 5 Review */
  step = 0;
  readonly totalSteps = 6;
  maxReached = 0;

  // ----- existing state (kept) -----
  mode: 'add' | 'edit' = 'add';
  members: any[] = [];
  groupId!: string | null;
  expenses!: Expense[];
  expenseForm: FormGroup;
  expensetoEdit: any;

  participants: any[] = [];
  participantAmounts: { [key: string]: number } = {};
  participantShares: { [key: string]: number } = {};
  participantPercentages: { [key: string]: number } = {};

  loading = true;
  selectedSplitType: SplitType = 'equal';
  openClose: 'open' | 'closed' = 'closed';

  categories: { title: string; categories: string[] }[] = [
    { title: 'Entertainment', categories: ['Games', 'Movies', 'Music', 'Sports'] },
    { title: 'Food and drink', categories: ['Groceries', 'Dine out', 'Liquor'] },
    { title: 'Home', categories: ['Rent', 'Mortgage', 'Household supplies', 'Furniture', 'Maintenance', 'Pets', 'Services', 'Electronics'] },
    { title: 'Transportation', categories: ['Parking', 'Car', 'Bus/train', 'Gas/fuel', 'Taxi', 'Bicycle', 'Hotel', 'Rental Vehicle'] },
    { title: 'Utilities', categories: ['Electricity', 'Heat/gas', 'Water', 'TV/Phone/Internet', 'Trash', 'Cleaning'] },
    { title: 'Uncategorized', categories: ['Other'] },
  ];

  nameIdeas = ['🍕 Dinner', '🛒 Groceries', '🚕 Cab ride', '🏠 Rent', '🎬 Movie night', '✈️ Trip'];
  pad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];

  animationOptions: AnimationOptions = {
    path: 'https://lottie.host/3419d991-1edb-4ddf-b98e-3d286f6182b1/2KbLPyUKO0.json',
    autoplay: true, loop: true, renderer: 'svg',
  };
  showAnimation = false;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.expenseForm = this.fb.group({
      expenseName: ['', Validators.required],
      payer: ['', Validators.required],
      participants: [[]],
      expenseDate: [new Date().toISOString().split('T')[0]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0), this.validateDecimal]],
      category: ['Other'],
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap((params) => {
          this.groupId = params['groupId'];
          return this.fetchMembers().pipe(
            catchError((error) => { console.error('Error fetching members:', error); return of([]); }),
            finalize(() => {
              this.participants.forEach((p) => {
                this.participantAmounts[p.id] = 0;
                this.participantShares[p.id] = 0;
                this.participantPercentages[p.id] = 0;
              });
              if (this.route.snapshot.queryParams['mode'] === 'edit' && this.route.snapshot.queryParams['expense']) {
                this.expensetoEdit = JSON.parse(this.route.snapshot.queryParams['expense']);
                this.mode = 'edit';
                this.populateFormWithExpenseData(this.expensetoEdit);
                this.maxReached = this.totalSteps - 1;
              }
              this.loading = false;
            }),
          );
        }),
      )
      .subscribe();
  }

  // ===== CARD NAVIGATION =====
  goNext(): void {
    if (!this.canProceed(this.step)) { this.markStep(this.step); return; }
    if (this.step < this.totalSteps - 1) {
      this.step++;
      this.maxReached = Math.max(this.maxReached, this.step);
      this.scrollTop();
    }
  }
  goBack(): void { if (this.step > 0) { this.step--; this.scrollTop(); } }
  goTo(step: number): void { if (step <= this.maxReached) { this.step = step; this.scrollTop(); } }
  private scrollTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  canProceed(step: number): boolean {
    switch (step) {
      case 0: return !!this.expenseForm.get('expenseName')?.valid;
      case 1: return !!this.expenseForm.get('amount')?.valid && this.amount > 0;
      case 2: return !!this.expenseForm.get('payer')?.value;
      case 3: return this.canAddExpense() && (this.selectedSplitType === 'equal' || this.isTotalAmountValid());
      default: return true;
    }
  }
  private markStep(step: number): void {
    if (step === 0) this.expenseForm.get('expenseName')?.markAsTouched();
    if (step === 1) this.expenseForm.get('amount')?.markAsTouched();
    if (step === 2) this.expenseForm.get('payer')?.markAsTouched();
  }

  // ===== STEP 1 · NAME =====
  pickName(idea: string): void {
    const value = idea.replace(/^\S+\s/, '');
    this.expenseForm.patchValue({ expenseName: value });
  }

  // ===== STEP 2 · AMOUNT =====
  get amount(): number { return parseFloat(this.expenseForm.get('amount')?.value) || 0; }

  padPress(key: string): void {
    const ctrl = this.expenseForm.get('amount')!;
    let v = (ctrl.value ?? '').toString();
    if (key === 'back') v = v.slice(0, -1);
    else if (key === '.') { if (!v.includes('.')) v = (v || '0') + '.'; }
    else { if (v.includes('.') && v.split('.')[1].length >= 2) return; v += key; }
    ctrl.setValue(v);
    ctrl.markAsTouched();
  }

  // ===== STEP 3 · PAYER =====
  get payerId(): string { return this.expenseForm.get('payer')?.value; }
  selectPayer(id: string): void { this.expenseForm.patchValue({ payer: id }); }

  // ===== STEP 4 · SPLIT =====
  fetchMembers() {
    if (this.groupId) {
      return this.groupService.getMembers(this.groupId).pipe(
        tap((members) => { this.members = members; this.participants = members; }),
      );
    }
    return of([]);
  }

  toggleSplitType(splitType: SplitType): void { this.selectedSplitType = splitType; }

  isParticipantSelected(participantId: string): boolean {
    return !!this.participants.find((p) => p.id === participantId);
  }

  includeParticipant(id: string): void {
    if (!this.isParticipantSelected(id)) this.toggleParticipant(id);
  }
  excludeParticipant(id: string): void {
    if (this.isParticipantSelected(id) && this.participants.length > 1) this.toggleParticipant(id);
  }

  toggleParticipant(participantId: string): void {
    if (this.participants.find((p) => p.id === participantId)) {
      if (this.participants.length <= 1) return;
      this.participants = this.participants.filter((p) => p.id !== participantId);
      delete this.participantAmounts[participantId];
      delete this.participantShares[participantId];
      delete this.participantPercentages[participantId];
    } else {
      const member = this.members.find((m) => m.id === participantId);
      this.participants.push(member);
      this.participantAmounts[participantId] = 0;
      this.participantShares[participantId] = 0;
      this.participantPercentages[participantId] = 0;
    }
  }

  updateParticipantAmount(memberId: string, event: any): void {
    const v = event.target.valueAsNumber;
    if (this.selectedSplitType === 'percentages') this.participantPercentages[memberId] = v || 0;
    else this.participantAmounts[memberId] = v || 0;
  }
  updateParticipantShares(memberId: string, event: any): void {
    this.participantShares[memberId] = event.target.valueAsNumber || 0;
  }

  canAddExpense(): boolean {
    return this.participants.length >= 1 && this.participants.some((p) => p.id !== this.payerId);
  }

  get perPerson(): number {
    const n = this.participants.length;
    return n ? this.amount / n : 0;
  }
  get allocated(): number {
    if (this.selectedSplitType === 'percentages')
      return this.participants.reduce((s, p) => s + (this.participantPercentages[p.id] || 0), 0);
    if (this.selectedSplitType === 'shares')
      return this.participants.reduce((s, p) => s + (this.participantShares[p.id] || 0), 0);
    return this.participants.reduce((s, p) => s + (this.participantAmounts[p.id] || 0), 0);
  }
  get remaining(): number {
    if (this.selectedSplitType === 'percentages') return 100 - this.allocated;
    if (this.selectedSplitType === 'equal') return 0;
    return this.amount - this.allocated;
  }

  isTotalAmountValid(): boolean {
    if (this.selectedSplitType === 'unequal') {
      const allPositive = this.participants.every((p) => (this.participantAmounts[p.id] || 0) > 0);
      const total = this.participants.reduce((s, p) => s + (this.participantAmounts[p.id] || 0), 0);
      return allPositive && Math.abs(total - this.amount) < 0.005 && this.amount > 0;
    }
    if (this.selectedSplitType === 'shares') {
      return this.participants.every((p) => {
        const share = this.participantShares[p.id];
        return Number.isInteger(share) && share > 0;
      });
    }
    if (this.selectedSplitType === 'percentages') {
      const allPositive = this.participants.every((p) => (this.participantPercentages[p.id] || 0) > 0);
      const total = this.participants.reduce((s, p) => s + (this.participantPercentages[p.id] || 0), 0);
      return allPositive && Math.abs(total - 100) < 0.01;
    }
    return true;
  }

  toggleCalculator(): void { this.openClose = this.openClose === 'open' ? 'closed' : 'open'; }

  // ===== STEP 6 · REVIEW =====
  get payerName(): string {
    const p = this.members.find((m) => m.id === this.payerId);
    return p ? (p.name || p.email) : '';
  }
  get categoryValue(): string { return this.expenseForm.get('category')?.value; }
  get dateValue(): string { return this.expenseForm.get('expenseDate')?.value; }

  reviewBreakdown(): { member: any; owes: number; isPayer: boolean }[] {
    const owed = this.computeParticipantsMap();
    return this.participants.map((m) => ({ member: m, owes: owed[m.id] || 0, isPayer: m.id === this.payerId }));
  }

  private computeParticipantsMap(): { [key: string]: number } {
    const amount = parseFloat(this.amount.toFixed(2));
    const out: { [key: string]: number } = {};
    if (this.selectedSplitType === 'unequal') {
      this.participants.forEach((p) => (out[p.id] = this.participantAmounts[p.id]));
    } else if (this.selectedSplitType === 'shares') {
      const totalShares = this.participants.reduce((s, p) => s + (this.participantShares[p.id] || 0), 0);
      this.participants.forEach((p) => (out[p.id] = parseFloat(((amount * this.participantShares[p.id]) / totalShares).toFixed(2))));
    } else if (this.selectedSplitType === 'percentages') {
      this.participants.forEach((p) => (out[p.id] = parseFloat(((amount * this.participantPercentages[p.id]) / 100).toFixed(2))));
    } else {
      const splitAmount = parseFloat((amount / this.participants.length).toFixed(2));
      this.participants.forEach((p) => (out[p.id] = splitAmount));
    }
    return out;
  }

  // ===== SUBMIT =====
  onAddOrUpdateExpense(): void {
    if (!(this.expenseForm.valid && this.canAddExpense())) return;

    const expenseData: any = { ...this.expenseForm.value, groupId: this.groupId };
    const payer = this.members.find((m) => m.id === expenseData.payer);
    expenseData.payerName = payer ? payer.name : '';
    expenseData.amount = parseFloat(this.amount.toFixed(2));
    expenseData.participants = this.computeParticipantsMap();
    expenseData.splitType = this.selectedSplitType;
    if (!expenseData.expenseDate) expenseData.expenseDate = new Date().toISOString().split('T')[0];

    if (this.mode === 'add') this.onAddExpense(expenseData);
    else this.onUpdateExpense(expenseData);
  }

  onAddExpense(expenseData: any): void {
    this.showAnimation = true; this.isProcessing = true;
    this.expenseService.addExpense(expenseData).subscribe(
      () => {
        this.expenseForm.reset();
        this.showAnimation = false; this.isProcessing = false;
        this.router.navigate(['group', this.groupId, 'list-balance'], { queryParams: { groupId: this.groupId } });
      },
      (error) => { console.error('Error adding expense:', error); this.showAnimation = false; this.isProcessing = false; },
    );
  }

  onUpdateExpense(expenseData: any): void {
    this.showAnimation = true; this.isProcessing = true;
    this.expenseService.editExpense(this.expensetoEdit._id, expenseData, this.expensetoEdit).subscribe(
      () => {
        this.expenseForm.reset();
        this.showAnimation = false; this.isProcessing = false;
        this.router.navigate(['group', this.groupId, 'list-balance'], { queryParams: { groupId: this.groupId } });
      },
      (error) => { console.error('Error editing expense:', error); this.showAnimation = false; this.isProcessing = false; },
    );
  }

  populateFormWithExpenseData(expense: any): void {
    const expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0];
    const participants: any[] = [];
    Object.keys(expense.participants).forEach((participantId) => {
      const memberDetails = this.members.find((m) => m.id === participantId);
      participants.push(memberDetails);
      this.participantAmounts[participantId] = expense.participants[participantId];
      this.participantShares[participantId] = 0;
      this.participantPercentages[participantId] = parseFloat(((expense.participants[participantId] * 100) / expense.amount).toFixed(2));
    });
    this.expenseForm.setValue({
      expenseName: expense.expenseName,
      payer: expense.payer,
      expenseDate,
      description: expense.description,
      amount: expense.amount,
      participants,
      category: expense.category,
    });
    this.participants = participants;
    this.selectedSplitType = expense.splitType;
  }

  validateDecimal(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (value !== null && value !== undefined && value !== '') {
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      if (!decimalRegex.test(value)) return { invalidDecimal: true };
    }
    return null;
  }

  initials(email: string): string {
    return (email || '').split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
  }
  shortName(email: string): string { return (email || '').split('@')[0]; }
  discStyle(email: string): string {
    let h = 0;
    for (const c of email || '') h = (h * 31 + c.charCodeAt(0)) % 360;
    return `linear-gradient(150deg, hsl(${h} 70% 58%), hsl(${(h + 40) % 360} 70% 46%))`;
  }
}

/* ============================================================
   Drag directive lives in this same file on purpose, so there
   is NO separate module to import. Declare BOTH classes in your
   NgModule: declarations: [AddExpenseComponent, BubbleDragDirective]
   ============================================================ */

/** Installed once for the whole app: after ANY pointer release, wipe every
 *  leftover drag clone on the next tick. This is the failsafe that makes a
 *  stuck ghost impossible, regardless of which bubble started the drag or
 *  whether Angular destroyed it mid-gesture. */
let bubbleGhostGuardInstalled = false;
function installBubbleGhostGuard(): void {
  if (bubbleGhostGuardInstalled || typeof window === 'undefined') return;
  bubbleGhostGuardInstalled = true;
  const sweep = () => setTimeout(() => {
    document.querySelectorAll('.bubble-ghost').forEach((g) => g.remove());
  }, 0);
  window.addEventListener('pointerup', sweep);
  window.addEventListener('pointercancel', sweep);
  window.addEventListener('blur', sweep);
}

@Directive({ selector: '[appBubbleDrag]' })
export class BubbleDragDirective implements OnDestroy {
  @Input() dropZone?: HTMLElement;
  @Input() hotClass = 'hot';
  @Output() droppedInside = new EventEmitter<void>();
  @Output() droppedOutside = new EventEmitter<void>();
  @Output() tapped = new EventEmitter<void>();

  private ghost?: HTMLElement;
  private startX = 0; private startY = 0; private moved = false; private downAt = 0;
  private active = false;

  constructor(private host: ElementRef<HTMLElement>) { installBubbleGhostGuard(); }

  /** Remove any orphaned ghost clones anywhere in the document. */
  private static sweep(): void {
    document.querySelectorAll('.bubble-ghost').forEach((g) => g.remove());
  }

  private onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('input, .valwrap')) return;
    BubbleDragDirective.sweep();          // self-heal: clear leftovers before we start
    this.active = true;
    this.moved = false;
    this.startX = e.clientX; this.startY = e.clientY; this.downAt = Date.now();

    // Listen on window, NOT the bubble: Angular may destroy the bubble mid-drag
    // when it moves between pot and tray, which would orphan the listeners otherwise.
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.active) return;
    // Only spawn a ghost once a real drag begins — a plain click never creates one.
    if (!this.moved && (Math.abs(e.clientX - this.startX) > 6 || Math.abs(e.clientY - this.startY) > 6)) {
      this.moved = true;
      this.spawnGhost();
      this.host.nativeElement.style.opacity = '.3';
    }
    if (this.ghost) {
      this.ghost.style.left = e.clientX + 'px';
      this.ghost.style.top = e.clientY + 'px';
    }
    this.setHot(this.isOverZone(e));
  };

  private onUp = (e: PointerEvent) => {
    if (!this.active) return;
    const inside = this.isOverZone(e);
    const wasTap = !this.moved && Date.now() - this.downAt < 350;
    this.end();
    if (wasTap) { this.tapped.emit(); return; }
    if (inside) this.droppedInside.emit(); else this.droppedOutside.emit();
  };

  private spawnGhost(): void {
    const src = (this.host.nativeElement.querySelector('.disc') as HTMLElement) ?? this.host.nativeElement;
    const g = src.cloneNode(true) as HTMLElement;
    g.classList.add('bubble-ghost');
    Object.assign(g.style, {
      position: 'fixed', zIndex: '9999', pointerEvents: 'none', margin: '0',
      left: this.startX + 'px', top: this.startY + 'px',
      transform: 'translate(-50%, -50%) scale(1.12)',
    } as CSSStyleDeclaration);
    document.body.appendChild(g);
    this.ghost = g;
  }

  private isOverZone(e: PointerEvent): boolean {
    if (!this.dropZone) return false;
    const r = this.dropZone.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  private setHot(on: boolean) { this.dropZone?.classList.toggle(this.hotClass, on); }

  private end(): void {
    this.active = false;
    this.setHot(false);
    if (this.host?.nativeElement) this.host.nativeElement.style.opacity = '';
    this.ghost?.remove();
    this.ghost = undefined;
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    BubbleDragDirective.sweep();          // belt-and-suspenders
  }

  ngOnInit() { this.host.nativeElement.addEventListener('pointerdown', this.onDown); }
  ngOnDestroy() {
    this.host.nativeElement.removeEventListener('pointerdown', this.onDown);
    this.end();
  }
}