import numpy as np

TARGET = 0.04


def random_policy(ctx):
    return int(ctx.rng.choice(ctx.candidates))


def by_level_policy(ctx):
    level = ctx.level_estimate
    pool = [t for t in ctx.candidates if ctx.corpus.level[t] == level]
    if not pool:
        pool = [t for t in ctx.candidates if ctx.corpus.level[t] <= level] or list(ctx.candidates)
    return int(ctx.rng.choice(pool))


def rules_policy(ctx):
    level = ctx.level_estimate
    for t in ctx.candidates:
        if ctx.corpus.level[t] <= level:
            return int(t)
    return int(ctx.candidates[0])


def ml_policy(ctx, due_weight=0.3):
    c = ctx.corpus
    k = ctx.k_hat
    cand = np.array(ctx.candidates)
    p_unknown = 1.0 / (1.0 + np.exp((k - 0.5) / 0.08))
    unknown = (c.counts[cand] @ p_unknown + c.oov[cand]) / c.length[cand]
    shaky = ((k > 0.35) & (k < 0.75)).astype(np.float32)
    due = (c.counts[cand] @ shaky) / c.length[cand]
    score = -np.abs(unknown - TARGET) + due_weight * np.minimum(due, 0.1)
    return int(cand[int(np.argmax(score))])


POLICIES = {
    "random": random_policy,
    "by_level": by_level_policy,
    "rules": rules_policy,
    "ml": ml_policy,
}