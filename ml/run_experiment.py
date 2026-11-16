import argparse
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import wilcoxon
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score

from xinna_ml import learner as learner_cfg
from xinna_ml.corpus import merge, stories_from_sql, synthetic_corpus
from xinna_ml.knowledge import KnowledgeModel
from xinna_ml.recommenders import POLICIES
from xinna_ml.segment import make_segmenter
from xinna_ml.simulation import collect_training, make_learners, run_policy
from xinna_ml.vocab import Vocab

HERE = Path(__file__).resolve().parent
COLORS = {"random": "#9A948A", "by_level": "#D4A843", "rules": "#C83E34", "ml": "#4F7942"}
LABELS = {"random": "Случайный", "by_level": "По уровню HSK", "rules": "Правила (как в приложении)", "ml": "ML (модель знаний)"}
GRID = [
    ("базовые", 1.2, 0.06),
    ("слабое обучение", 0.5, 0.06),
    ("сильное обучение", 2.0, 0.06),
    ("узкая зона комфорта", 1.2, 0.03),
    ("широкая зона комфорта", 1.2, 0.12),
]


def md_table(df, digits=3):
    cols = list(df.columns)
    lines = ["| " + " | ".join(cols) + " |", "|" + "|".join("---" for _ in cols) + "|"]
    for _, row in df.iterrows():
        cells = [f"{v:.{digits}f}" if isinstance(v, (float, np.floating)) else str(v) for v in row]
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def bootstrap_ci(values, n=2000, seed=0):
    rng = np.random.default_rng(seed)
    means = [rng.choice(values, size=len(values), replace=True).mean() for _ in range(n)]
    return np.percentile(means, [2.5, 97.5])


def build_world(args):
    vocab = Vocab()
    segment = make_segmenter(vocab, use_jieba=not args.no_jieba)
    rng = np.random.default_rng(args.seed)
    corpus = synthetic_corpus(vocab, rng, args.texts)
    sql_files = [p for p in (HERE.parent / "data" / "seed_texts.sql", HERE.parent / "data" / "seed_texts_more.sql") if p.exists()]
    n_real = 0
    if sql_files:
        real = stories_from_sql(sql_files, vocab, segment)
        n_real = real.size
        corpus = merge(corpus, real)
    print(f"Словарь: {vocab.size} слов | корпус: {corpus.size} текстов ({n_real} настоящих историй)", flush=True)
    return vocab, corpus, n_real


def run_sensitivity(args, vocab, corpus, gb, out):
    learners = make_learners(vocab, min(args.n_test, 30), args.seed + 300)
    defaults = dict(learner_cfg.CONFIG)
    rows = []
    for label, gain_v, sigma_v in GRID:
        learner_cfg.CONFIG.update(learn_gain=gain_v, sigma=sigma_v)
        res = {}
        for name in ("random", "rules", "ml"):
            d, c, _, _ = run_policy(name, POLICIES[name], vocab, corpus, learners, args.days, args.seed, model=gb if name == "ml" else None)
            res[name] = (d.groupby("learner").abs_err.mean().mean(), d.hit.mean(), (c[:, -1] - c[:, 0]).mean())
        print(f"  {label}: MAE random={res['random'][0]:.3f} rules={res['rules'][0]:.3f} ml={res['ml'][0]:.3f}", flush=True)
        rows.append(
            dict(setting=label, learn_gain=gain_v, sigma=sigma_v, mae_random=res["random"][0], mae_rules=res["rules"][0], mae_ml=res["ml"][0],
                 hit_rules=res["rules"][1], hit_ml=res["ml"][1], gain_rules=res["rules"][2], gain_ml=res["ml"][2])
        )
    learner_cfg.CONFIG.update(defaults)
    sens = pd.DataFrame(rows)
    sens.to_csv(out / "results_sensitivity.csv", index=False)
    (out / "results_sensitivity.md").write_text(md_table(sens), encoding="utf-8")
    print(md_table(sens), flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n-train", type=int, default=120)
    ap.add_argument("--n-test", type=int, default=60)
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--texts", type=int, default=400)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default=str(HERE / "output"))
    ap.add_argument("--no-jieba", action="store_true")
    ap.add_argument("--sensitivity-only", action="store_true")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    vocab, corpus, n_real = build_world(args)
    model_path = out / "model.joblib"

    if args.sensitivity_only:
        gb, _, _ = joblib.load(model_path)
        run_sensitivity(args, vocab, corpus, gb, out)
        return

    print("Обучение модели знаний...", flush=True)
    Xtr, ytr = collect_training(vocab, corpus, args.n_train, args.days, args.seed + 100)
    gb = KnowledgeModel("gb").fit(Xtr, ytr)
    lr = KnowledgeModel("lr").fit(Xtr, ytr)
    hsk_only = KnowledgeModel("lr").fit(Xtr[:, :6], ytr)
    joblib.dump((gb, lr, hsk_only), model_path)
    print(f"Обучающих ответов: {len(ytr)}", flush=True)

    learners = make_learners(vocab, args.n_test, args.seed + 200)
    frames, curves, kt_rows = [], {}, None
    for name, policy in POLICIES.items():
        print(f"Симуляция: {name}", flush=True)
        df, curve, X, y = run_policy(name, policy, vocab, corpus, learners, args.days, args.seed, model=gb if name == "ml" else None)
        frames.append(df)
        curves[name] = curve
        if name == "random":
            kt_rows = (X, y)
    records = pd.concat(frames, ignore_index=True)
    records.to_csv(out / "records.csv", index=False)

    Xte, yte = kt_rows
    preds = {
        "GradientBoosting (признаки истории и темы)": gb.predict_correct(Xte),
        "Логистическая регрессия": lr.predict_correct(Xte),
        "Только уровень HSK слова": hsk_only.predict_correct(Xte[:, :6]),
        "Общая точность ученика": np.clip(Xte[:, 11], 0.01, 0.99),
    }
    kt = pd.DataFrame(
        [dict(model=m, auc=roc_auc_score(yte, p), brier=brier_score_loss(yte, p), logloss=log_loss(yte, np.clip(p, 1e-6, 1 - 1e-6))) for m, p in preds.items()]
    )
    kt.to_csv(out / "results_model.csv", index=False)

    rows, per_learner = [], {}
    for name in POLICIES:
        d = records[records.policy == name]
        per = d.groupby("learner").agg(mae=("abs_err", "mean"), hit=("hit", "mean"), comfy=("comfy", "mean"), hard=("too_hard", "mean"))
        per["gain"] = curves[name][:, -1] - curves[name][:, 0]
        per_learner[name] = per
        lo, hi = bootstrap_ci(per["mae"].to_numpy())
        glo, ghi = bootstrap_ci(per["gain"].to_numpy())
        rows.append(
            dict(policy=name, mae=per["mae"].mean(), mae_ci=f"[{lo:.3f}; {hi:.3f}]", hit_rate=per["hit"].mean(), comfy_rate=per["comfy"].mean(),
                 too_hard_rate=per["hard"].mean(), words_gained=per["gain"].mean(), gain_ci=f"[{glo:.1f}; {ghi:.1f}]",
                 unique_texts=d.groupby("learner").text.nunique().mean())
        )
    summary = pd.DataFrame(rows)
    summary.to_csv(out / "results_policies.csv", index=False)

    tests = pd.DataFrame(
        [
            dict(comparison=f"ml vs {other}", p_mae=wilcoxon(per_learner["ml"]["mae"], per_learner[other]["mae"]).pvalue,
                 p_gain=wilcoxon(per_learner["ml"]["gain"], per_learner[other]["gain"]).pvalue)
            for other in ("random", "by_level", "rules")
        ]
    )
    tests.to_csv(out / "results_tests.csv", index=False)

    fig, ax = plt.subplots(figsize=(8, 4.5))
    for i, name in enumerate(POLICIES):
        m = per_learner[name]["mae"]
        lo, hi = bootstrap_ci(m.to_numpy())
        ax.bar(i, m.mean(), color=COLORS[name], yerr=[[m.mean() - lo], [hi - m.mean()]], capsize=5)
    ax.set_xticks(range(4), [LABELS[n] for n in POLICIES], rotation=12)
    ax.set_ylabel("Средняя |доля незнакомых слов − 0.04|")
    ax.set_title("Близость рекомендованных текстов к целевой сложности")
    fig.tight_layout()
    fig.savefig(out / "fig_mae.png", dpi=160)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 4.5))
    bins = np.linspace(0, 0.6, 31)
    for name in POLICIES:
        ax.hist(records[records.policy == name].u.clip(0, 0.6), bins=bins, alpha=0.5, color=COLORS[name], label=LABELS[name])
    ax.axvspan(0.02, 0.08, color="#4F7942", alpha=0.1)
    ax.set_xlabel("Доля незнакомых слов в рекомендованном тексте")
    ax.set_ylabel("Число рекомендаций")
    ax.legend()
    fig.tight_layout()
    fig.savefig(out / "fig_unknown_ratio.png", dpi=160)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 4.5))
    x = np.arange(args.days + 1)
    for name in POLICIES:
        mean = curves[name].mean(axis=0)
        se = curves[name].std(axis=0) / np.sqrt(curves[name].shape[0])
        ax.plot(x, mean, color=COLORS[name], label=LABELS[name])
        ax.fill_between(x, mean - 1.96 * se, mean + 1.96 * se, color=COLORS[name], alpha=0.15)
    ax.set_xlabel("День")
    ax.set_ylabel("Ожидаемое число слов, которые ученик знает")
    ax.legend()
    fig.tight_layout()
    fig.savefig(out / "fig_vocabulary_growth.png", dpi=160)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(5.5, 5.5))
    p = preds["GradientBoosting (признаки истории и темы)"]
    edges = np.quantile(p, np.linspace(0, 1, 11))
    idx = np.clip(np.digitize(p, edges[1:-1]), 0, 9)
    ax.plot([0, 1], [0, 1], "--", color="#9A948A")
    ax.plot([p[idx == b].mean() for b in range(10)], [yte[idx == b].mean() for b in range(10)], "o-", color="#4F7942")
    ax.set_xlabel("Предсказанная вероятность верного ответа")
    ax.set_ylabel("Доля верных ответов")
    ax.set_title("Калибровка модели знаний")
    fig.tight_layout()
    fig.savefig(out / "fig_calibration.png", dpi=160)
    plt.close(fig)

    md = [
        "# Результаты эксперимента (симуляция)", "",
        f"Учеников: {args.n_test}, дней: {args.days}, текстов в корпусе: {corpus.size} (из них настоящих: {n_real}).", "",
        "## Рекомендаторы", "", md_table(summary), "",
        "## Парные тесты Уилкоксона (p-значения)", "", md_table(tests, 4), "",
        "## Модель знаний (отложенные ученики)", "", md_table(kt),
    ]
    (out / "results.md").write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md), flush=True)


if __name__ == "__main__":
    main()