chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ adTechEnabled: false });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleAdTech") {
    chrome.tabs.query({ url: "<all_urls>" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, { action: "toggleAdTech", value: request.value });
      });
    });
    chrome.storage.sync.set({ adTechEnabled: request.value });
  }
});
