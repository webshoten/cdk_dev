export function getConfig() {
  const apiUrl = window.__CONFIG__?.apiUrl;
  if (!apiUrl) {
    throw new Error("config.js が読み込まれていません");
  }
  return { apiUrl };
}
