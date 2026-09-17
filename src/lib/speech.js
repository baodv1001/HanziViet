// Đọc từ bằng Web Speech API (giọng zh-CN nếu trình duyệt có).
export function speak(text) {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  u.rate = 0.85;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('zh'));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
  return true;
}
