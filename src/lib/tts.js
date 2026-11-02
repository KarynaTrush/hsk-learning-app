export function ttsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakZh(text, rate = 0.9) {
  if (!ttsSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}