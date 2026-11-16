import re
from dataclasses import dataclass

import numpy as np


@dataclass
class Corpus:
    counts: np.ndarray
    oov: np.ndarray
    length: np.ndarray
    level: np.ndarray
    ids: list
    real: np.ndarray

    @property
    def size(self):
        return len(self.ids)


def _from_tokens(token_lists, levels, ids, real, vocab):
    counts = np.zeros((len(token_lists), vocab.size), dtype=np.float32)
    oov = np.zeros(len(token_lists), dtype=np.float32)
    for row, tokens in enumerate(token_lists):
        for token in tokens:
            idx = vocab.index.get(token)
            if idx is None:
                oov[row] += 1
            else:
                counts[row, idx] += 1
    length = counts.sum(axis=1) + oov
    return Corpus(counts, oov, length, np.array(levels), ids, np.array(real))


def synthetic_corpus(vocab, rng, n_texts=400):
    tokens, levels = [], []
    for _ in range(n_texts):
        level = int(rng.integers(1, 7))
        weights = np.zeros(6)
        weights[:level] = 0.15 / level
        weights[level - 1] += 0.45
        if level >= 2:
            weights[level - 2] += 0.25
        if level >= 3:
            weights[level - 3] += 0.15
        weights /= weights.sum()
        n = int(rng.integers(40, 121))
        main_topic = int(rng.integers(vocab.n_topics))
        picked = []
        for lv in rng.choice(6, size=n, p=weights):
            pool = vocab.by_level(lv + 1)
            if rng.random() < 0.5:
                topical = pool[vocab.topic[pool] == main_topic]
                if len(topical) > 5:
                    pool = topical
            rank = np.arange(len(pool))
            p = 1.0 / (rank + 8.0) ** 0.8
            picked.append(vocab.hanzi[int(rng.choice(pool, p=p / p.sum()))])
        n_oov = int(round(n * 0.01))
        picked.extend(["#oov"] * n_oov)
        tokens.append(picked)
        levels.append(level)
    ids = [f"syn{i}" for i in range(n_texts)]
    return _from_tokens(tokens, levels, ids, [False] * n_texts, vocab)


def stories_from_sql(paths, vocab, segment):
    levels, sentences = {}, {}
    text_row = re.compile(r"\('(s\d+)', (\d+), '(\w+)', (\d+), '")
    sent_row = re.compile(r"\('(s\d+)', (\d+), '((?:[^']|'')*)', '((?:[^']|'')*)'\)")
    for path in paths:
        sql = open(path, encoding="utf-8").read()
        for slug, hsk, *_ in text_row.findall(sql):
            levels[slug] = int(hsk)
        for slug, pos, zh, _ in sent_row.findall(sql):
            sentences.setdefault(slug, []).append((int(pos), zh.replace("''", "'")))
    ids = sorted(sentences, key=lambda s: int(s[1:]))
    token_lists = [segment("".join(zh for _, zh in sorted(sentences[s]))) for s in ids]
    return _from_tokens(token_lists, [levels.get(s, 1) for s in ids], ids, [True] * len(ids), vocab)


def merge(a, b):
    return Corpus(
        np.vstack([a.counts, b.counts]),
        np.concatenate([a.oov, b.oov]),
        np.concatenate([a.length, b.length]),
        np.concatenate([a.level, b.level]),
        a.ids + b.ids,
        np.concatenate([a.real, b.real]),
    )