import "./style.css";
import { ANIMALS, type Point, type Stroke } from "./animals";

const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const promptEl = document.getElementById("prompt")!;
const starsEl = document.getElementById("stars")!;
const levelBar = document.getElementById("levelbar")!;
const prevBtn = document.getElementById("prev") as HTMLButtonElement;
const nextBtn = document.getElementById("next") as HTMLButtonElement;
const resetBtn = document.getElementById("reset") as HTMLButtonElement;

const SAMPLE_STEP = 6;
const HIT_RADIUS = 46;
const COMPLETE_THRESHOLD = 0.82;
const DUO_GREEN = "#58cc02";
const DUO_GREY = "#e5e5e5";
const DUO_INK = "#3c3c3c";
const PARTY_COLORS = ["#58cc02", "#1cb0f6", "#ffc800", "#ff9600", "#ce82ff", "#ff4b4b"];

type Confetto = { x: number; y: number; vx: number; vy: number; color: string; rot: number; vr: number; life: number };

let levelIdx = 0;
let strokeIdx = 0;
let sampledStrokes: Point[][] = [];
let covered: boolean[][] = [];
let drawing = false;
let userPath: Point[] = [];
let confetti: Confetto[] = [];
let completed = new Set<number>();
let lockInput = false;
let finishTime = 0;

function fitCanvas() {
  const size = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.62, 640);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = canvas.style.height = `${size}px`;
  canvas.width = canvas.height = Math.floor(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  loadLevel(levelIdx, false);
}

function sampleStrokePoints(stroke: Stroke, w: number, h: number): Point[] {
  const pts = stroke.points;
  const out: Point[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = { x: pts[i].x * w, y: pts[i].y * h };
    const b = { x: pts[i + 1].x * w, y: pts[i + 1].y * h };
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.floor(len / SAMPLE_STEP));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      out.push({ x: a.x + dx * t, y: a.y + dy * t });
    }
  }
  const last = pts[pts.length - 1];
  out.push({ x: last.x * w, y: last.y * h });
  return out;
}

function buildLevelBar() {
  levelBar.innerHTML = "";
  ANIMALS.forEach((A, i) => {
    const d = document.createElement("button");
    d.className = "level-dot";
    if (i === levelIdx) d.classList.add("active");
    if (completed.has(i)) d.classList.add("done");
    d.textContent = `${A.emoji} ${A.name}`;
    d.addEventListener("click", () => loadLevel(i));
    levelBar.appendChild(d);
  });
  const active = levelBar.querySelector(".level-dot.active") as HTMLElement | null;
  if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function loadLevel(idx: number, animate = true) {
  levelIdx = ((idx % ANIMALS.length) + ANIMALS.length) % ANIMALS.length;
  strokeIdx = 0;
  const def = ANIMALS[levelIdx];
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  sampledStrokes = def.strokes.map((s) => sampleStrokePoints(s, w, h));
  covered = sampledStrokes.map((s) => s.map(() => false));
  userPath = [];
  lockInput = false;
  finishTime = 0;
  promptEl.textContent = `Draw the ${def.name}! ${def.emoji}`;
  starsEl.textContent = "";
  if (animate) promptEl.classList.remove("celebrate");
  buildLevelBar();
}

function drawCoverage(pts: Point[], cov: boolean[]) {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = "#58a700"; ctx.lineWidth = 44;
  drawCoverageRuns(pts, cov);
  ctx.strokeStyle = DUO_GREEN; ctx.lineWidth = 36;
  drawCoverageRuns(pts, cov);
  ctx.restore();
}

function drawCoverageRuns(pts: Point[], cov: boolean[]) {
  let i = 0;
  while (i < pts.length) {
    if (!cov[i]) { i++; continue; }
    const start = i;
    while (i < pts.length && cov[i]) i++;
    const end = i - 1;
    if (end === start) {
      ctx.beginPath();
      ctx.arc(pts[start].x, pts[start].y, 18, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle as string; ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(pts[start].x, pts[start].y);
      for (let k = start + 1; k <= end; k++) ctx.lineTo(pts[k].x, pts[k].y);
      ctx.stroke();
    }
  }
}

function drawArrow(a: Point, b: Point, color: string) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const ax = a.x + Math.cos(angle) * 38;
  const ay = a.y + Math.sin(angle) * 38;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ax, ay); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax + Math.cos(angle) * 12, ay + Math.sin(angle) * 12);
  ctx.lineTo(ax + Math.cos(angle + 2.5) * 16, ay + Math.sin(angle + 2.5) * 16);
  ctx.lineTo(ax + Math.cos(angle - 2.5) * 16, ay + Math.sin(angle - 2.5) * 16);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function pathFromPts(pts: Point[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (const pt of pts) ctx.lineTo(pt.x, pt.y);
}

function draw() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const t = performance.now();
  const def = ANIMALS[levelIdx];

  // If finished, draw colored animal
  if (lockInput && finishTime > 0) {
    const phase = Math.min(1, (t - finishTime) / 600);
    def.strokes.forEach((s, si) => {
      const pts = sampledStrokes[si];
      if (s.closed && s.fill) {
        ctx.save();
        ctx.fillStyle = s.fill;
        ctx.globalAlpha = phase;
        pathFromPts(pts); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = def.outlineColor;
      ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.lineJoin = "round";
      pathFromPts(pts);
      if (s.closed) ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
  } else {
    sampledStrokes.forEach((pts, si) => {
      const stroke = def.strokes[si];
      const isCurrent = si === strokeIdx;
      const isDone = si < strokeIdx;

      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (isDone) {
        ctx.lineWidth = 56; ctx.strokeStyle = "#58a700"; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
        ctx.lineWidth = 46; ctx.strokeStyle = DUO_GREEN; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
      } else if (isCurrent) {
        ctx.lineWidth = 56; ctx.strokeStyle = "#cfcfcf"; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
        ctx.lineWidth = 46; ctx.strokeStyle = "#ffffff"; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
        ctx.setLineDash([2, 26]);
        ctx.lineWidth = 8; ctx.strokeStyle = DUO_INK; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
      } else {
        ctx.lineWidth = 56; ctx.strokeStyle = DUO_GREY; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
        ctx.lineWidth = 46; ctx.strokeStyle = "#f7f7f7"; pathFromPts(pts); if (stroke.closed) ctx.closePath(); ctx.stroke();
      }
      ctx.restore();

      if (isCurrent) {
        drawCoverage(pts, covered[si]);
        // start marker + arrow
        const a = pts[0], b = pts[Math.min(8, pts.length - 1)];
        drawArrow(a, b, "#1cb0f6");
        ctx.save(); ctx.fillStyle = "#1cb0f6";
        ctx.beginPath(); ctx.arc(a.x, a.y, 13 + Math.sin(t / 200) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    });

    // user trail
    if (userPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = "#1cb0f6";
      ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.lineJoin = "round";
      pathFromPts(userPath); ctx.stroke();
      ctx.restore();
    }
  }

  // confetti
  if (confetti.length) {
    confetti.forEach((c) => {
      c.vy += 0.25; c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.life -= 1;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-6, -3, 12, 6);
      ctx.restore();
    });
    confetti = confetti.filter((c) => c.life > 0 && c.y < h + 40);
  }
}

function localPoint(e: PointerEvent): Point {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function markCovered(pt: Point) {
  if (lockInput || strokeIdx >= sampledStrokes.length) return;
  const guide = sampledStrokes[strokeIdx];
  const cov = covered[strokeIdx];
  for (let i = 0; i < guide.length; i++) {
    if (cov[i]) continue;
    const dx = guide[i].x - pt.x, dy = guide[i].y - pt.y;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) cov[i] = true;
  }
  const ratio = cov.filter(Boolean).length / cov.length;
  if (ratio >= COMPLETE_THRESHOLD) advanceStroke();
}

function advanceStroke() {
  strokeIdx++;
  userPath = [];
  beep(660);
  if (strokeIdx >= sampledStrokes.length) finishLevel();
}

function spawnConfetti() {
  const w = canvas.clientWidth;
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: w / 2 + (Math.random() - 0.5) * 100,
      y: canvas.clientHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 11 - 4,
      color: PARTY_COLORS[Math.floor(Math.random() * PARTY_COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      life: 130,
    });
  }
}

function finishLevel() {
  lockInput = true;
  finishTime = performance.now();
  completed.add(levelIdx);
  const def = ANIMALS[levelIdx];
  starsEl.textContent = "⭐⭐⭐";
  promptEl.textContent = `It's a ${def.name}! ${def.emoji}`;
  promptEl.classList.add("celebrate");
  spawnConfetti();
  beep(880); setTimeout(() => beep(1100), 150); setTimeout(() => beep(1320), 300);
  speak(def.sound);
  buildLevelBar();
  setTimeout(() => loadLevel(levelIdx + 1), 3500);
}

let speechReady = false;
function primeSpeech() {
  if (speechReady) return;
  speechReady = true;
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {}
}
function speak(phrase: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(phrase);
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1.2;
      const voices = synth.getVoices();
      const kid = voices.find((v) =>
        /child|kid|samantha|karen|google us english|microsoft zira|microsoft aria/i.test(v.name)
      );
      if (kid) u.voice = kid;
      synth.cancel();
      synth.speak(u);
    }, 500);
  } catch {}
}

let audioCtx: AudioContext | null = null;
function beep(freq: number) {
  try {
    audioCtx ??= new AudioContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq; o.type = "sine";
    g.gain.value = 0.08;
    o.connect(g).connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    o.stop(audioCtx.currentTime + 0.26);
  } catch {}
}

canvas.addEventListener("pointerdown", (e) => {
  primeSpeech();
  if (lockInput) return;
  drawing = true;
  canvas.setPointerCapture(e.pointerId);
  userPath = [localPoint(e)];
  markCovered(userPath[0]);
});
canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;
  const pt = localPoint(e);
  userPath.push(pt);
  markCovered(pt);
});
const endStroke = () => { drawing = false; userPath = []; };
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);
canvas.addEventListener("pointerleave", endStroke);

prevBtn.addEventListener("click", () => { primeSpeech(); loadLevel(levelIdx - 1); });
nextBtn.addEventListener("click", () => { primeSpeech(); loadLevel(levelIdx + 1); });
resetBtn.addEventListener("click", () => { primeSpeech(); loadLevel(levelIdx); });
levelBar.addEventListener("click", () => primeSpeech());

window.addEventListener("resize", fitCanvas);
fitCanvas();
(function loop() { draw(); requestAnimationFrame(loop); })();
