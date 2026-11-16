import numpy as np

GUESS = 0.25
CONFIG = {"learn_gain": 1.2, "sigma": 0.06, "decay": 0.0003}


def comfort(u):
    return np.exp(-(((u - 0.04) / CONFIG["sigma"]) ** 2))


class Learner:
    def __init__(self, vocab, level, rng):
        self.vocab = vocab
        self.level = level
        hsk = vocab.hsk
        base = np.where(hsk <= level, 0.95, np.where(hsk == level + 1, 0.45, 0.06))
        favorite = rng.choice(vocab.n_topics, size=2, replace=False)
        in_favorite = np.isin(vocab.topic, favorite)
        base = np.where(in_favorite & (hsk <= level + 3) & (hsk > level), np.maximum(base, 0.8), base)
        base = np.where(~in_favorite & (hsk <= level), np.minimum(base, 0.9), base)
        noise = rng.beta(2, 2, size=vocab.size) * 0.2 - 0.1
        self.K = np.clip(base + noise, 0.0, 1.0)
        self.favorite = favorite

    def copy(self):
        clone = Learner.__new__(Learner)
        clone.vocab, clone.level, clone.K, clone.favorite = self.vocab, self.level, self.K.copy(), self.favorite
        return clone

    def answer(self, widx, rng):
        return rng.random(len(widx)) < GUESS + (1 - GUESS) * self.K[widx]

    def unknown_ratio(self, corpus, t):
        return float((corpus.counts[t] @ (self.K < 0.5).astype(np.float32) + corpus.oov[t]) / corpus.length[t])

    def read(self, corpus, t):
        u = self.unknown_ratio(corpus, t)
        exposure = np.minimum(corpus.counts[t], 2.0) / 2.0
        known = self.K > 0.5
        self.K = np.where(known, self.K + (1 - self.K) * 0.12 * exposure, self.K)
        gain = CONFIG["learn_gain"] * comfort(u) * (1 - self.K) * exposure
        self.K = np.where(~known, np.clip(self.K + gain, 0, 1), self.K)
        return u

    def daily_decay(self):
        self.K = self.K * np.exp(-CONFIG["decay"])

    def known_words(self):
        return float(self.K.sum())