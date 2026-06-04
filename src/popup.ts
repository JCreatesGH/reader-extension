declare const chrome: any;

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function init() {
  const tab = await activeTab();
  chrome.tabs.sendMessage(tab.id, { type: "MEASURE" }, (stats: any) => {
    document.getElementById("time")!.textContent = stats?.text ?? "—";
    document.getElementById("words")!.textContent = `${stats?.words ?? 0} words`;
  });
  document.getElementById("reader")!.onclick = () =>
    chrome.tabs.sendMessage(tab.id, { type: "READER" });
}
init();
