export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function extractChineseOnly(text) {
  if (!text) return "";
  const matches = String(text).match(/[\u4e00-\u9fff，。！？、]+/g);
  return matches ? matches.join(" ") : "";
}

function pickBestZhVoice() {
  const voices = window.speechSynthesis.getVoices();
  const zhVoices = voices.filter((v) => /zh[-_]CN|cmn/i.test(v.lang));
  if (!zhVoices.length) return null;
  return (
    zhVoices.find((v) => /Tingting|Xiaoxiao|Yunxi|Google|Natural|Premium|Enhanced/i.test(v.name)) ||
    zhVoices[0]
  );
}

export function speakZh(text, rate = 0.88) {
  if (!ttsSupported() || !text) return;
  const cleanZh = extractChineseOnly(text);
  if (!cleanZh) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanZh);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  const bestVoice = pickBestZhVoice();
  if (bestVoice) utterance.voice = bestVoice;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
