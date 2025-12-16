import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

type Participant = { id: string; name: string };

@Component({
  selector: 'app-spin-wheel',
  templateUrl: './spin-wheel.component.html',
  styleUrls: ['./spin-wheel.component.css'],
})
export class SpinWheelComponent implements AfterViewInit {
  @ViewChild('wheelCanvas', { static: true }) wheelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nameInput') set focusInput(element: ElementRef) {
    if (element) {
      element.nativeElement.focus();
    }
  }

  participants: { id: string; name: string }[] = [];

  showAdd = false;
  newName = '';
  spinning = false;
  showConfetti = false;
  confettiPieces: { left: number; delay: number; color: string }[] = [];


  private ctx!: CanvasRenderingContext2D;
  private dpr = 1;

  private currentRotation = 0; // radians
  private spinAnimId: number | null = null;

  showWinner = false;
  winnerName = '';

  private readonly wheelSize = 400; // css px
  private readonly pointerAngle = -Math.PI / 2; // top
  private readonly minSpinTurns = 6;
  private readonly maxExtraTurns = 4;

  ngAfterViewInit(): void {
    const canvas = this.wheelCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    this.ctx = ctx;

    this.setupCanvas();
    this.drawWheel();

    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.spinAnimId) cancelAnimationFrame(this.spinAnimId);
  }

  private onResize = () => {
    this.setupCanvas();
    this.drawWheel();
  };

  private setupCanvas() {
    const canvas = this.wheelCanvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    this.dpr = dpr;

    canvas.style.width = `${this.wheelSize}px`;
    canvas.style.height = `${this.wheelSize}px`;

    canvas.width = Math.floor(this.wheelSize * dpr);
    canvas.height = Math.floor(this.wheelSize * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  addParticipant() {
    const name = this.newName.trim();
    if (!name) return;

    this.participants = [...this.participants, { id: crypto.randomUUID(), name }];
    this.newName = '';
    this.showAdd = false;
    this.drawWheel();
  }

  removeParticipant(id: string) {
    if (this.spinning) return;
    this.participants = this.participants.filter((p) => p.id !== id);
    this.drawWheel();
  }

  trackById = (_: number, p: Participant) => p.id;

  spin() {
    if (this.spinning) return;
    if (this.participants.length < 2) return;

    this.showWinner = false;
    this.winnerName = '';
    this.spinning = true;

    const n = this.participants.length;
    const slice = (2 * Math.PI) / n;
    const pickedIndex = Math.floor(Math.random() * n);

    const pickedCenter = pickedIndex * slice + slice / 2;
    const baseFinal = this.normalizeAngle(this.pointerAngle - pickedCenter);

    const turns = this.minSpinTurns + Math.random() * this.maxExtraTurns;
    const finalRotation = baseFinal + turns * 2 * Math.PI;

    const start = performance.now();
    const duration = 3200 + Math.random() * 700;
    const startRot = this.currentRotation;
    const endRot = startRot + finalRotation;

    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

      this.currentRotation = startRot + (endRot - startRot) * eased;
      this.drawWheel();

      if (p < 1) this.spinAnimId = requestAnimationFrame(animate);
      else {
        this.spinAnimId = null;
        this.spinning = false;

        const winner = this.getWinnerFromRotation();
        this.winnerName = winner?.name ?? '';
        this.showWinner = true;
        this.triggerConfetti();
      }
    };

    this.spinAnimId = requestAnimationFrame(animate);
  }

  spinAgain() {
    this.showWinner = false;
    this.winnerName = '';
    this.spin();
  }

  closeWinner() {
    this.showWinner = false;
    this.showConfetti = false;
  }

  private triggerConfetti() {
  this.showConfetti = true;
  this.confettiPieces = [];

  const colors = ['#fbbf24', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  for (let i = 0; i < 55; i++) {
    this.confettiPieces.push({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  setTimeout(() => {
    this.showConfetti = false;
    this.confettiPieces = [];
  }, 4000);
}


  private getWinnerFromRotation(): Participant | null {
    const n = this.participants.length;
    if (!n) return null;

    const slice = (2 * Math.PI) / n;
    const wheelAngle = this.normalizeAngle(this.pointerAngle - this.currentRotation);
    const index = Math.floor(wheelAngle / slice);

    return this.participants[index] ?? null;
  }

  private normalizeAngle(a: number) {
    const tau = 2 * Math.PI;
    return ((a % tau) + tau) % tau;
  }

  private drawWheel() {
    const ctx = this.ctx;
    const n = this.participants.length;

    ctx.clearRect(0, 0, this.wheelSize, this.wheelSize);

    const cx = this.wheelSize / 2;
    const cy = this.wheelSize / 2;
    const radius = this.wheelSize / 2 - 10;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.currentRotation);
    ctx.translate(-cx, -cy);

    if (n < 2) {
  this.drawEmptyState(ctx, cx, cy, radius);
  ctx.restore();
  return;
}


    const slice = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
      const start = i * slice;
      const end = start + slice;

      const hue = (i * 360) / n;
      const g = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      g.addColorStop(0, `hsla(${hue}, 70%, 65%, 0.55)`);
      g.addColorStop(1, `hsla(${hue}, 70%, 35%, 0.35)`);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const label = this.participants[i].name;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.fillText(this.ellipsize(label, 18), radius - 18, 0);
      ctx.restore();
    }

    // hub
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // shine
    const shine = ctx.createRadialGradient(cx - 10, cy - 12, 5, cx - 10, cy - 12, 60);
    shine.addColorStop(0, 'rgba(255,255,255,0.25)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    this.drawPointer(ctx, cx, cy, radius);
  }

  private drawPointer(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const px = cx;
    const py = cy - r - 6;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(px, py + 6);
    ctx.lineTo(px - 16, py + 42);
    ctx.lineTo(px + 16, py + 42);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(px, py + 40, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fill();

    ctx.restore();
  }

  private drawEmptyState(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
}


  private ellipsize(s: string, max: number) {
    const t = s.trim();
    if (t.length <= max) return t;
    return t.slice(0, Math.max(0, max - 1)) + '…';
  }
}
