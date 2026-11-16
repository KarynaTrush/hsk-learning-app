import re

CJK = re.compile(r"[\u4e00-\u9fff]+")


def make_segmenter(vocab, use_jieba=True):
    if use_jieba:
        try:
            import jieba

            jieba.setLogLevel(60)

            def with_jieba(text):
                return [t for t in jieba.lcut(text) if CJK.fullmatch(t)]

            return with_jieba
        except ImportError:
            pass

    words = set(vocab.hanzi)
    max_len = max(len(h) for h in vocab.hanzi)

    def max_match(text):
        tokens = []
        for chunk in CJK.findall(text):
            i = 0
            while i < len(chunk):
                for size in range(min(max_len, len(chunk) - i), 0, -1):
                    piece = chunk[i : i + size]
                    if piece in words or size == 1:
                        tokens.append(piece)
                        i += size
                        break
        return tokens

    return max_match