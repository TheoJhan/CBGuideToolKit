chrome.runtime.onInstalled.addListener(() => {
  console.log("Citations Guide: Extension installed.");
  // Set default enabled state
  chrome.storage.sync.get(['enabled'], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
      console.log("Citations Guide: Extension enabled by default");
    }
  });
});
