chrome.action.setPopup({ popup: "popup.html" });

document.getElementById("toggleAdTech").addEventListener("change", (e) => {
  chrome.runtime.sendMessage({ action: "toggleAdTech", value: e.target.checked });
});

chrome.storage.sync.get("adTechEnabled", (data) => {
  document.getElementById("toggleAdTech").checked = data.adTechEnabled || false;
});
