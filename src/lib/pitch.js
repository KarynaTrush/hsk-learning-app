const MIN_HZ = 70;
const MAX_HZ = 500;
const POINTS = 30;
export const ST_PER_LEVEL = 1.6;

export function detectPitch(buffer, sampleRate, { minHz = MIN_HZ, maxHz = MAX_HZ, minRms = 0.0015 } = {}) {
  const n = buffer.length;
  let energy = 0;
  for (let i = 0; i < n; i++) energy += buffer[i] * buffer[i];
  const rms = Math.sqrt(energy / n);
  if (rms < minRms) return null;

  const minLag = Math.floor(sampleRate / maxHz);
  const maxLag = Math.min(Math.floor(sampleRate / minHz), (n >> 1) - 1);
  const nsdf = new Float32Array(maxLag + 2);
  for (let tau = 0; tau <= maxLag + 1; tau++) {
    let acf = 0;
    let m = 0;
    for (let i = 0; i < n - tau; i++) {
      acf += buffer[i] * buffer[i + tau];
      m += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
    }
    nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
  }

  let tau = 1;
  while (tau < maxLag && nsdf[tau] > 0) tau++;
  const peaks = [];
  while (tau < maxLag) {
    while (tau < maxLag && nsdf[tau] <= 0) tau++;
    let peakTau = -1;
    let peakVal = -Infinity;
    while (tau < maxLag && nsdf[tau] > 0) {
      if (nsdf[tau] > peakVal) {
        peakVal = nsdf[tau];
        peakTau = tau;
      }
      tau++;
    }
    if (peakTau >= minLag) peaks.push({ tau: peakTau, val: peakVal });
  }
  if (!peaks.length) return null;

  const top = Math.max(...peaks.map((p) => p.val));
  const chosen = peaks.find((p) => p.val >= 0.9 * top);
  const a = nsdf[chosen.tau - 1];
  const b = nsdf[chosen.tau];
  const c = nsdf[chosen.tau + 1];
  const denom = a - 2 * b + c;
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  return { freq: sampleRate / (chosen.tau + shift), clarity: chosen.val, rms };
}

function median(values) {
  const sorted = [...values].sort((x, y) => x - y);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))];
}

function ramp(x, a, b) {
  return Math.min(1, Math.max(0, (x - a) / (b - a)));
}

export function medianFilter(values, radius = 2) {
  return values.map((_, i) => {
    const from = Math.max(0, i - radius);
    const to = Math.min(values.length, i + radius + 1);
    return median(values.slice(from, to));
  });
}

function movingAverage(values, radius = 2) {
  return values.map((_, i) => {
    const from = Math.max(0, i - radius);
    const to = Math.min(values.length, i + radius + 1);
    return mean(values.slice(from, to));
  });
}

export function toSemitones(freqs) {
  if (!freqs.length) return [];
  const ref = median(freqs);
  return freqs.map((f) => 12 * Math.log2(f / ref));
}

export function resample(values, count) {
  if (values.length === 0) return [];
  if (values.length === 1) return Array(count).fill(values[0]);
  return Array.from({ length: count }, (_, i) => {
    const pos = (i / (count - 1)) * (values.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(values.length - 1, lo + 1);
    return values[lo] + (values[hi] - values[lo]) * (pos - lo);
  });
}

export function centered(values) {
  const m = mean(values);
  return values.map((v) => v - m);
}

function pickVoiced(frames, peak, rmsShare, minClarity) {
  return frames.filter((f) => f.rms >= peak * rmsShare && f.clarity >= minClarity);
}

function longestRun(frames, maxGapMs) {
  let best = [];
  let cur = [];
  for (const f of frames) {
    if (cur.length && f.t - cur[cur.length - 1].t > maxGapMs) {
      if (cur.length > best.length) best = cur;
      cur = [];
    }
    cur.push(f);
  }
  return cur.length > best.length ? cur : best;
}

function resampleByTime(points, count) {
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  if (t1 <= t0) return Array(count).fill(points[0].st);
  const out = [];
  let k = 0;
  for (let i = 0; i < count; i++) {
    const t = t0 + ((t1 - t0) * i) / (count - 1);
    while (k < points.length - 2 && points[k + 1].t < t) k++;
    const a = points[k];
    const b = points[k + 1];
    const span = b.t - a.t || 1;
    const w = Math.min(1, Math.max(0, (t - a.t) / span));
    out.push(a.st + (b.st - a.st) * w);
  }
  return out;
}

export function contourFromFrames(frames) {
  const candidates = frames.filter((f) => f.freq >= MIN_HZ && f.freq <= MAX_HZ);
  if (candidates.length < 6) return null;
  const peak = percentile(candidates.map((f) => f.rms).sort((a, b) => a - b), 0.9);
  let voiced = pickVoiced(candidates, peak, 0.2, 0.75);
  if (voiced.length < 8) voiced = pickVoiced(candidates, peak, 0.1, 0.6);
  if (voiced.length < 8) return null;
  let run = longestRun(voiced, 90);
  if (run.length < 8) return null;

  const ref = median(run.map((f) => f.freq));
  let points = run.map((f) => {
    let st = 12 * Math.log2(f.freq / ref);
    while (st > 7) st -= 12;
    while (st < -7) st += 12;
    return { t: f.t, st };
  });

  if (points.length >= 14) {
    const trim = Math.max(1, Math.floor(points.length * 0.08));
    points = points.slice(trim, points.length - trim);
  }
  const smooth = medianFilter(points.map((p) => p.st), 1);
  points = points.map((p, i) => ({ t: p.t, st: smooth[i] }));
  const contour = centered(resampleByTime(points, POINTS));
  return { contour, voicedMs: Math.round(run[run.length - 1].t - run[0].t), frames: run.length };
}

export function contourFromPoints(points, minVoiced = 8) {
  const frames = points.map((p, i) => ({ t: p.t ?? i * 25, freq: p.freq, clarity: p.clarity ?? 1, rms: p.rms ?? 1 }));
  const r = contourFromFrames(frames);
  return r && r.frames >= minVoiced ? r.contour : null;
}

function features(raw) {
  const c = movingAverage(raw, 1);
  const n = c.length;
  const q = Math.max(2, Math.round(n * 0.2));
  const head = mean(c.slice(0, q));
  const tail = mean(c.slice(n - q));
  const sorted = [...c].sort((a, b) => a - b);
  const span = percentile(sorted, 0.92) - percentile(sorted, 0.08);
  let minIdx = 0;
  for (let i = 1; i < n; i++) if (c[i] < c[minIdx]) minIdx = i;
  let tv = 0;
  for (let i = 0; i < n - 1; i++) tv += Math.abs(c[i + 1] - c[i]);
  return {
    head,
    tail,
    delta: tail - head,
    span,
    min: c[minIdx],
    minPos: minIdx / (n - 1),
    extra: Math.max(0, tv - Math.abs(c[n - 1] - c[0])),
  };
}

function memberships(raw) {
  const f = features(raw);
  const mono = 1 - ramp(f.extra, 1.8, 5);

  const depth = (f.head + f.tail) / 2 - f.min;
  const flat =
    Math.sqrt((1 - ramp(f.span, 2.2, 5.2)) * (1 - ramp(Math.abs(f.delta), 1, 2.6))) * (1 - 0.8 * ramp(depth, 1, 2));

  const rise =
    ramp(f.delta, 0.8, 2.8) * (0.5 + 0.5 * mono) * (1 - 0.8 * ramp(f.head - f.min, 1.8, 4)) * (1 - 0.7 * ramp(f.minPos, 0.3, 0.5));

  const fall = ramp(-f.delta, 1.5, 3.6) * (0.5 + 0.5 * mono) * (1 - 0.8 * ramp(f.tail - f.min, 1.5, 3.5));

  const place = 1 - ramp(Math.abs(f.minPos - 0.45), 0.25, 0.5);
  const dip = ramp(depth, 0.9, 2.4) * place * (0.4 + 0.6 * ramp(f.tail - f.min, 0.8, 2));
  const half = 0.8 * ramp(-f.delta, 0.8, 1.8) * (1 - ramp(-f.delta, 2.4, 4.2)) * ramp(f.minPos, 0.5, 0.8);

  return { 1: flat, 2: rise, 3: Math.max(dip, half), 4: fall };
}

export function scoreContour(contour, tone) {
  const m = memberships(contour);
  const scores = [1, 2, 3, 4].map((candidate) => ({ tone: candidate, score: Math.round(100 * m[candidate]) }));
  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
  return { score: scores[tone - 1].score, best, all: scores };
}

const CHAO = {
  1: [[0, 5], [1, 5]],
  2: [[0, 3], [1, 5]],
  3: [[0, 2], [0.4, 1], [1, 4]],
  4: [[0, 5], [1, 1]],
};

export function chartTemplate(tone, count = 40) {
  const keys = CHAO[tone];
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    let k = 0;
    while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
    const [t0, v0] = keys[k];
    const [t1, v1] = keys[k + 1];
    return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  });
}

export function alignToTemplate(contour, tone) {
  if (!contour || !contour.length) return [];
  const template = chartTemplate(tone, contour.length);
  const shift = mean(template);
  return contour.map((st) => st / ST_PER_LEVEL + shift);
}

export function referenceContour(tone, count = 40) {
  return centered(chartTemplate(tone, count).map((l) => l * ST_PER_LEVEL));
}
