import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

type Participant = { id: string; name: string };
type Mode = 'wheel' | 'race';

type ConfettiPiece = { left: number; delay: number; color: string };

type Racer = {
  id: string;
  name: string;
  emoji: string;
  progress: number; // 0..1
  wobble: boolean;
  tripped: boolean;
};

@Component({
  selector: 'app-spin-wheel',
  templateUrl: './spin-wheel.component.html',
  styleUrls: ['./spin-wheel.component.css'],
})
export class SpinWheelComponent implements AfterViewInit {
  @ViewChild('wheelCanvas', { static: true }) wheelCanvas!: ElementRef<HTMLCanvasElement>;

  // ========= Core state =========
  mode: Mode = 'race';

  participants: Participant[] = []; // ✅ no pre-added names
  showAdd = false;
  newName = '';
  spinning = false;

  showWinner = false;
  winnerName = '';

  // ========= Limits =========
  readonly maxParticipants = 8; // ✅ strict 8
  maxError = '';

  // ========= Confetti =========
  showConfetti = false;
  confettiPieces: ConfettiPiece[] = [];

  // ========= Wheel (canvas) =========
  private ctx!: CanvasRenderingContext2D;
  private currentRotation = 0; // radians
  private spinAnimId: number | null = null;

  private readonly wheelSize = 400;
  private readonly pointerAngle = -Math.PI / 2;
  private readonly minSpinTurns = 6;
  private readonly maxExtraTurns = 4;

  // ========= Race =========
  raceRacers: Racer[] = [];
  private raceAnimId: number | null = null;
  private raceWinnerId: string | null = null;

  private readonly emojiPool = [
    '🐢','🐰','🐸','🦊','🐼','🐵','🦄','🐙',
    '✈️','🚀','🚁','🚗','🚲','🚂',
    '🏰','🏢','🗼','🎁','🍕','🧸'
  ];

  // ========= Lifecycle =========
  ngAfterViewInit(): void {
    const canvas = this.wheelCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    this.ctx = ctx;

    this.setupCanvas();
    this.drawWheel();

    window.addEventListener('resize', this.onResize);
    this.syncRaceRacers();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.spinAnimId) cancelAnimationFrame(this.spinAnimId);
    if (this.raceAnimId) cancelAnimationFrame(this.raceAnimId);
  }

  private onResize = () => {
    this.setupCanvas();
    this.drawWheel();
  };

  private setupCanvas() {
    const canvas = this.wheelCanvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = `${this.wheelSize}px`;
    canvas.style.height = `${this.wheelSize}px`;

    canvas.width = Math.floor(this.wheelSize * dpr);
    canvas.height = Math.floor(this.wheelSize * dpr);

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ========= UI actions =========
  setMode(m: Mode) {
    this.mode = m;
    this.maxError = '';
    this.syncRaceRacers();
    this.drawWheel();
  }

  addParticipant() {
    this.maxError = '';
    const name = this.newName.trim();
    if (!name) return;

    if (this.participants.length >= this.maxParticipants) {
      this.maxError = `Max ${this.maxParticipants} participants allowed.`;
      return;
    }

    this.participants = [...this.participants, { id: crypto.randomUUID(), name }];
    this.newName = '';
    this.showAdd = false;

    this.syncRaceRacers();
    this.drawWheel();
  }

  removeParticipant(id: string) {
    if (this.spinning) return;

    this.participants = this.participants.filter((p) => p.id !== id);
    this.maxError = '';

    this.syncRaceRacers();
    this.drawWheel();
  }

  trackById = (_: number, p: Participant) => p.id;

  spin() {
    if (this.spinning) return;
    if (this.participants.length < 2) return;

    this.showWinner = false;
    this.winnerName = '';

    if (this.mode === 'wheel') this.spinWheel();
    else this.startRace();
  }

  spinAgain() {
    this.showWinner = false;
    this.winnerName = '';
    this.spin();
  }

  closeWinner() {
    this.showWinner = false;
  }

  // ========= Confetti =========
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

  // ========= Race =========
  private syncRaceRacers() {
    // keep a clean preview list when not racing
    this.raceRacers = this.participants.map((p, i) => ({
      id: p.id,
      name: p.name,
      emoji: this.emojiPool[i % this.emojiPool.length],
      progress: 0,
      wobble: false,
      tripped: false
    }));
  }

  private startRace() {
    this.spinning = true;
    this.showWinner = false;
    this.winnerName = '';

    // rebuild racers fresh
    this.syncRaceRacers();

    const winnerIndex = Math.floor(Math.random() * this.raceRacers.length);
    this.raceWinnerId = this.raceRacers[winnerIndex].id;

    const start = performance.now();
    const duration = 9000;

    const bias = new Map<string, number>();
    const tripAt = new Map<string, number>();
    this.raceRacers.forEach((r) => {
      bias.set(r.id, 0.85 + Math.random() * 0.35);
      tripAt.set(r.id, 0.18 + Math.random() * 0.55);
    });

    const nonWinners = this.raceRacers.filter(r => r.id !== this.raceWinnerId);
    const tripCount = Math.min(2, Math.max(1, nonWinners.length >= 4 ? 2 : 1));
    const trippers = nonWinners.sort(() => Math.random() - 0.5).slice(0, tripCount);

    const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

    const chaosEnd = 0.82; 
const MAX_NON_WINNER = 0.94;

const tick = (t: number) => {
  const p = Math.min(1, (t - start) / duration);
  const e = easeOut(p);

  for (const r of this.raceRacers) {
    const b = bias.get(r.id) ?? 1;

    r.wobble = Math.random() < 0.12;

    const willTrip = trippers.some(x => x.id === r.id);
    const tripTime = tripAt.get(r.id) ?? 0.4;
    const inTripWindow = willTrip && p > tripTime && p < tripTime + 0.05;

    r.tripped = inTripWindow;

    let prog: number;

    if (p < chaosEnd) {
      const noise =
        0.03 * Math.sin((p * 16 + b) * Math.PI) +
        0.02 * Math.sin((p * 9 + b) * Math.PI * 2);

      prog = e * (0.70 + noise) * b;
    } else {
      const sprintP = (p - chaosEnd) / (1 - chaosEnd);
      const sprintE = easeOut(Math.min(1, sprintP));

      if (r.id === this.raceWinnerId) {
        prog = 0.82 + 0.18 * sprintE;
      } else {
        prog = Math.min(
          MAX_NON_WINNER,
          0.80 + 0.12 * sprintE * b
        );
      }
    }

    if (r.tripped) {
      prog = Math.max(0, r.progress - 0.003);
    }

    if (r.id !== this.raceWinnerId) {
      prog = Math.min(prog, MAX_NON_WINNER);
    }

    r.progress = Math.max(0, Math.min(1, prog));
  }

  if (p >= 0.995) {
    const w = this.raceRacers.find(r => r.id === this.raceWinnerId);
    if (w) w.progress = 1;
  }

  if (p < 1) {
    this.raceAnimId = requestAnimationFrame(tick);
  } else {
    this.raceAnimId = null;
    this.spinning = false;

    const w = this.raceRacers.find(r => r.id === this.raceWinnerId);
    this.winnerName = w?.name ?? '';
    this.showWinner = true;
    this.triggerConfetti();
  }
};


    if (this.raceAnimId) cancelAnimationFrame(this.raceAnimId);
    this.raceAnimId = requestAnimationFrame(tick);
  }

  // ========= Wheel =========
  private spinWheel() {
    this.spinning = true;
    this.showWinner = false;
    this.winnerName = '';

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
      const eased = 1 - Math.pow(1 - p, 3);

      this.currentRotation = startRot + (endRot - startRot) * eased;
      this.drawWheel();

      if (p < 1) {
        this.spinAnimId = requestAnimationFrame(animate);
      } else {
        this.spinAnimId = null;
        this.spinning = false;

        const winner = this.getWinnerFromRotation();
        this.winnerName = winner?.name ?? '';
        this.showWinner = true;
        this.triggerConfetti();
      }
    };

    if (this.spinAnimId) cancelAnimationFrame(this.spinAnimId);
    this.spinAnimId = requestAnimationFrame(animate);
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

    // ✅ empty wheel until at least 2 participants (no text in canvas)
    if (n < 2) {
      this.drawEmptyState(ctx, cx, cy, radius);
      ctx.restore();
      this.drawPointer(ctx, cx, cy, radius);
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

  private drawEmptyState(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
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
