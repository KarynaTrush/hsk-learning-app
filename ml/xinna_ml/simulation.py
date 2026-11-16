from types import SimpleNamespace

import numpy as np
import pandas as pd

from .knowledge import Obs, features
from .learner import Learner

QUIZ_NEAR = 12
QUIZ_ANY = 8
TARGET = 0.04


def quiz_words(vocab, level, rng):
    near = np.where(vocab.hsk <= level + 1)[0]
    a = rng.choice(near, size=QUIZ_NEAR, replace=False)
    b = rng.choice(vocab.size, size=QUIZ_ANY, replace=False)
    return np.unique(np.concatenate([a, b]))


def collect_training(vocab, corpus, n_learners, days, seed):
    rng = np.random.default_rng(seed)
    X, y = [], []
    for _ in range(n_learners):
        level = int(rng.integers(0, 4))
        learner = Learner(vocab, level, rng)
        obs = Obs(vocab)
        unread = list(range(corpus.size))
        for day in range(days):
            w = quiz_words(vocab, level, rng)
            X.append(features(w, vocab.hsk, obs, day, vocab.topic))
            correct = learner.answer(w, rng)
            y.append(correct.astype(int))
            obs.update(w, correct, vocab.hsk, day, vocab.topic)
            t = unread.pop(int(rng.integers(len(unread))))
            learner.read(corpus, t)
            learner.daily_decay()
    return np.vstack(X), np.concatenate(y)


def make_learners(vocab, n, seed):
    rng = np.random.default_rng(seed)
    return [Learner(vocab, int(rng.integers(0, 4)), rng) for _ in range(n)]


def run_policy(name, policy, vocab, corpus, learners, days, seed, model=None):
    records, rows, curves = [], [], []
    all_idx = np.arange(vocab.size)
    for li, base in enumerate(learners):
        learner = base.copy()
        obs = Obs(vocab)
        unread = list(range(corpus.size))
        rng_quiz = np.random.default_rng(seed * 1000 + li)
        rng_ans = np.random.default_rng(seed * 31 + li)
        rng_pol = np.random.default_rng(seed * 7919 + li)
        curve = [learner.known_words()]
        for day in range(days):
            w = quiz_words(vocab, learner.level, rng_quiz)
            feats = features(w, vocab.hsk, obs, day, vocab.topic)
            correct = learner.answer(w, rng_ans)
            rows.append((feats, correct.astype(int)))
            obs.update(w, correct, vocab.hsk, day, vocab.topic)
            ctx = SimpleNamespace(
                rng=rng_pol,
                corpus=corpus,
                candidates=unread,
                level_estimate=obs.level_estimate(),
                k_hat=None,
            )
            if model is not None:
                ctx.k_hat = model.predict_known(features(all_idx, vocab.hsk, obs, day, vocab.topic))
            t = int(policy(ctx))
            u = learner.read(corpus, t)
            unread.remove(t)
            learner.daily_decay()
            curve.append(learner.known_words())
            records.append(
                dict(
                    policy=name, learner=li, day=day, text=corpus.ids[t], text_level=int(corpus.level[t]),
                    real=bool(corpus.real[t]), u=u, abs_err=abs(u - TARGET),
                    hit=0.02 <= u <= 0.08, comfy=u <= 0.10, too_hard=u > 0.20,
                )
            )
        curves.append(curve)
    X = np.vstack([r[0] for r in rows])
    y = np.concatenate([r[1] for r in rows])
    return pd.DataFrame(records), np.array(curves), X, y