export function detectPitch(buffer, sampleRate, { minHz = 70, maxHz = 450 } = {}) {
  const n = buffer.length;
  let energy = 0;
  for (let i = 0; i < n; i++) energy += buffer[i] * buffer[i];
  const rms = Math.sqrt(energy / n);
  if (rms < 0.008) return null;

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

export function medianFilter(values, radius = 2) {
  return values.map((_, i) => {
    const from = Math.max(0, i - radius);
    const to = Math.min(values.length, i + radius + 1);
    return median(values.slice(from, to));
  });
}

export function toSemitones(freqs) {
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
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.map((v) => v - mean);
}

const KEYS = {
  1: [[0, 0.3], [1, 0.3]],
  2: [[0, -2.5], [1, 2.5]],
  3: [[0, -0.5], [0.4, -3], [0.75, -2.2], [1, 2]],
  4: [[0, 3], [1, -3.5]],
};

export function referenceContour(tone, count = 40) {
  const keys = KEYS[tone];
  const out = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    let k = 0;
    while (k < keys.length - 2 && t > keys[k + 1][0]) k++;
    const [t0, v0] = keys[k];
    const [t1, v1] = keys[k + 1];
    return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0 || 1);
  });
  return centered(out);
}

export function scoreContour(semitones, tone) {
  const user = centered(resample(semitones, 40));
  const scores = [1, 2, 3, 4].map((candidate) => {
    const ref = referenceContour(candidate, 40);
    let sum = 0;
    for (let i = 0; i < 40; i++) sum += (user[i] - ref[i]) ** 2;
    const rmse = Math.sqrt(sum / 40);
    return { tone: candidate, score: Math.round(100 * Math.exp(-((rmse / 2.2) ** 2))) };
  });
  const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
  return { score: scores[tone - 1].score, best, all: scores };
}

export function contourFromPoints(points, minVoiced = 8) {
  const voiced = points.filter((p) => p.clarity >= 0.85 && p.freq >= 70 && p.freq <= 450);
  if (voiced.length < minVoiced) return null;
  return medianFilter(toSemitones(voiced.map((p) => p.freq)), 2);
}