export function speakHanzi(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  utter.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const zh = voices.find((v) => v.lang?.toLowerCase().startsWith("zh"));
  if (zh) utter.voice = zh;
  window.speechSynthesis.speak(utter);
}
