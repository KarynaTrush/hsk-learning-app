import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression

from .learner import GUESS


class Obs:
    def __init__(self, vocab):
        v = vocab.size
        self.n_ans = np.zeros(v)
        self.n_cor = np.zeros(v)
        self.last = np.full(v, -1.0)
        self.lvl_n = np.zeros(6)
        self.lvl_c = np.zeros(6)
        self.top_n = np.zeros(10)
        self.top_c = np.zeros(10)
        self.tot_n = 0.0
        self.tot_c = 0.0

    def update(self, widx, correct, hsk, day, topic):
        for w, c in zip(widx, correct):
            self.n_ans[w] += 1
            self.n_cor[w] += c
            self.last[w] = day
            self.lvl_n[hsk[w] - 1] += 1
            self.lvl_c[hsk[w] - 1] += c
            self.top_n[topic[w]] += 1
            self.top_c[topic[w]] += c
        self.tot_n += len(widx)
        self.tot_c += float(np.sum(correct))

    def level_estimate(self):
        acc = (self.lvl_c + 1.0) / (self.lvl_n + 2.0)
        good = np.where((acc >= 0.7) & (self.lvl_n >= 3))[0]
        return int(good.max() + 1) if len(good) else 1


def features(widx, hsk, obs, day, topic):
    h = hsk[widx] - 1
    ln = obs.lvl_n[h]
    lacc = (obs.lvl_c[h] + 1.0) / (ln + 2.0)
    n = obs.n_ans[widx]
    wacc = (obs.n_cor[widx] + 2.0 * lacc) / (n + 2.0)
    since = np.where(obs.last[widx] < 0, 30.0, np.minimum(day - obs.last[widx], 30.0)) / 30.0
    gacc = (obs.tot_c + 1.0) / (obs.tot_n + 2.0)
    onehot = np.eye(6)[h]
    t = topic[widx]
    tn = obs.top_n[t]
    tacc = (obs.top_c[t] + 1.0) / (tn + 2.0)
    return np.column_stack([onehot, lacc, np.log1p(ln), wacc, np.log1p(n), since, np.full(len(widx), gacc), lacc * hsk[widx], wacc * lacc, tacc, np.log1p(tn), tacc * hsk[widx]])


class KnowledgeModel:
    def __init__(self, kind="gb"):
        self.kind = kind
        if kind == "gb":
            self.model = HistGradientBoostingClassifier(max_iter=120, learning_rate=0.1, max_depth=4, random_state=0)
        else:
            self.model = LogisticRegression(max_iter=500)

    def fit(self, X, y):
        self.model.fit(X, y)
        return self

    def predict_correct(self, X):
        return self.model.predict_proba(X)[:, 1]

    def predict_known(self, X):
        return np.clip((self.predict_correct(X) - GUESS) / (1 - GUESS), 0.0, 1.0)