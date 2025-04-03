chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParmas = tab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParmas);
    setTimeout(
      () =>
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          videoId: urlParams.get("v"),
        }),
      5000
    );
  }
});
