import {
  Directive, ElementRef, EventEmitter, Input, Output, OnDestroy
} from '@angular/core';

/**
 * Pointer-based drag for the participant bubbles.
 *
 * - Lifts a "ghost" clone that follows the finger / cursor.
 * - Hit-tests against [dropZone] on release and emits droppedInside / droppedOutside.
 * - A quick press with no real movement is treated as a tap (emits tapped),
 *   so the bubbles still work nicely on touch where dragging is fiddly.
 *
 * Usage:
 *   <div appBubbleDrag
 *        [dropZone]="pot"
 *        (droppedInside)="includeParticipant(member.id)"
 *        (droppedOutside)="excludeParticipant(member.id)"
 *        (tapped)="toggleParticipant(member.id)"> ... </div>
 *   <div #pot> ... </div>
 */
@Directive({ selector: '[appBubbleDrag]' })
export class BubbleDragDirective implements OnDestroy {
  @Input() dropZone?: HTMLElement;
  /** Class toggled on the drop zone while a bubble hovers it. */
  @Input() hotClass = 'hot';

  @Output() droppedInside = new EventEmitter<void>();
  @Output() droppedOutside = new EventEmitter<void>();
  @Output() tapped = new EventEmitter<void>();

  private ghost?: HTMLElement;
  private startX = 0;
  private startY = 0;
  private moved = false;
  private downAt = 0;

  constructor(private host: ElementRef<HTMLElement>) {}

  private onDown = (e: PointerEvent) => {
    // Don't start a drag when the user is editing the inline amount input.
    if ((e.target as HTMLElement).closest('input, .valwrap')) return;

    const el = this.host.nativeElement;
    el.setPointerCapture(e.pointerId);
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.moved = false;
    this.downAt = Date.now();

    const source = (el.querySelector('.disc') as HTMLElement) ?? el;
    const ghost = source.cloneNode(true) as HTMLElement;
    ghost.classList.add('bubble-ghost');
    Object.assign(ghost.style, {
      position: 'fixed', zIndex: '9999', pointerEvents: 'none',
      left: e.clientX + 'px', top: e.clientY + 'px',
      transform: 'translate(-50%, -50%) scale(1.12)',
    } as CSSStyleDeclaration);
    document.body.appendChild(ghost);
    this.ghost = ghost;
    el.style.opacity = '.3';

    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onUp);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.ghost) return;
    if (Math.abs(e.clientX - this.startX) > 6 || Math.abs(e.clientY - this.startY) > 6) {
      this.moved = true;
    }
    this.ghost.style.left = e.clientX + 'px';
    this.ghost.style.top = e.clientY + 'px';
    this.setHot(this.isOverZone(e));
  };

  private onUp = (e: PointerEvent) => {
    if (!this.ghost) return;
    const inside = this.isOverZone(e);
    this.cleanup();

    const wasTap = !this.moved && Date.now() - this.downAt < 350;
    if (wasTap) { this.tapped.emit(); return; }
    if (inside) this.droppedInside.emit();
    else this.droppedOutside.emit();
  };

  private isOverZone(e: PointerEvent): boolean {
    if (!this.dropZone) return false;
    const r = this.dropZone.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right &&
           e.clientY >= r.top && e.clientY <= r.bottom;
  }

  private setHot(on: boolean) {
    this.dropZone?.classList.toggle(this.hotClass, on);
  }

  private cleanup() {
    const el = this.host.nativeElement;
    el.style.opacity = '';
    this.setHot(false);
    this.ghost?.remove();
    this.ghost = undefined;
    el.removeEventListener('pointermove', this.onMove);
    el.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('pointercancel', this.onUp);
  }

  ngOnInit() {
    this.host.nativeElement.addEventListener('pointerdown', this.onDown);
  }

  ngOnDestroy() {
    this.host.nativeElement.removeEventListener('pointerdown', this.onDown);
    this.cleanup();
  }
}