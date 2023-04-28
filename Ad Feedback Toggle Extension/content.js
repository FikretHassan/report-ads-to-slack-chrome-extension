let adTechEnabled = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleAdTech") {
    adTechEnabled = request.value;
    injectAdTechScript(adTechEnabled);
  }
});

chrome.storage.sync.get("adTechEnabled", (data) => {
  adTechEnabled = data.adTechEnabled || false;
  window.addEventListener("load", () => {
    injectAdTechScript(adTechEnabled);
  });
});

function injectAdTechScript(enabled) {
  // Remove existing injected adtech script if it exists
  const existingScript = document.getElementById("adtech-script");
  if (existingScript) {
    existingScript.remove();
  }

  if (enabled) {
    // Create a script element with the adtech.js source URL
    const script = document.createElement("script");
    script.id = "adtech-script"; // Add a unique identifier to the script element
    script.src = chrome.runtime.getURL("adtech.js");
    document.body.appendChild(script);
  }
}
