from pathlib import Path

import numpy as np
import pandas as pd

DEFAULT_WORDS = Path(__file__).resolve().parents[2] / "data" / "words.csv"


class Vocab:
    def __init__(self, csv_path=DEFAULT_WORDS):
        df = pd.read_csv(csv_path)
        df = df.sort_values(["hsk_level", "position"]).drop_duplicates("hanzi", keep="first").reset_index(drop=True)
        self.hanzi = df["hanzi"].tolist()
        self.hsk = df["hsk_level"].to_numpy().astype(int)
        self.index = {h: i for i, h in enumerate(self.hanzi)}
        self.size = len(self.hanzi)
        self.n_topics = 10
        self.topic = np.array([(sum(ord(c) for c in h) * 7919 + len(h) * 31) % self.n_topics for h in self.hanzi])

    def by_level(self, level):
        return np.where(self.hsk == level)[0]