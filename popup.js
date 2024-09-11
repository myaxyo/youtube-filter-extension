/**
 * Adds a keyword to the storage and updates the UI.
 * Reloads YouTube tabs to apply new keywords.
 *
 * @event click
 * @listens document#getElementById("add-keyword")
 */
document.getElementById("add-keyword").addEventListener("click", () => {
    const input = document.getElementById("keyword-input");
    const keyword = input.value.trim().toLowerCase();
    if (keyword) {
        chrome.storage.sync.get({ keywords: [] }, (result) => {
            const { keywords } = result;
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                chrome.storage.sync.set({ keywords }, () => {
                    input.value = ""; // Clear input
                    displayKeywords();
                    reloadYouTubeTabs(); // Reload YouTube tabs to apply new keywords
                });
            }
        });
    }
});

/**
 * Resets all keywords in the storage and updates the UI.
 * Reloads YouTube tabs on reset.
 *
 * @event click
 * @listens document#getElementById("reset-keywords")
 */
document.getElementById("reset-keywords").addEventListener("click", () => {
    chrome.storage.sync.set({ keywords: [] }, () => {
        const list = document.getElementById("keyword-list");
        list.innerHTML = "";
        reloadYouTubeTabs(); // Reload YouTube tabs on reset
    });
});

/**
 * Toggles the extension's enabled state and updates the UI.
 * Reloads YouTube tabs to apply the change.
 *
 * @event click
 * @listens document#getElementById("toggle-extension")
 */
document.getElementById("toggle-extension").addEventListener("click", () => {
    chrome.storage.sync.get({ extensionEnabled: true }, (result) => {
        const newState = !result.extensionEnabled;
        chrome.storage.sync.set({ extensionEnabled: newState }, () => {
            document.getElementById("toggle-extension").textContent = newState
                ? "Disable"
                : "Enable";
            reloadYouTubeTabs(); // Reload YouTube tabs to apply the change
        });
    });
});

/**
 * Displays the list of keywords from the storage in the UI.
 */
function displayKeywords() {
    chrome.storage.sync.get({ keywords: [] }, (result) => {
        const list = document.getElementById("keyword-list");
        list.innerHTML = "";
        result.keywords.forEach((keyword) => {
            const item = document.createElement("li");
            item.textContent = keyword;
            item.addEventListener("click", () => removeKeyword(keyword));
            list.appendChild(item);
        });
    });
}

/**
 * Removes a keyword from the storage and updates the UI.
 * Reloads YouTube tabs to apply the change.
 *
 * @param {string} keywordToRemove - The keyword to remove.
 */
function removeKeyword(keywordToRemove) {
    chrome.storage.sync.get({ keywords: [] }, (result) => {
        const updatedKeywords = result.keywords.filter(
            (keyword) => keyword !== keywordToRemove
        );
        chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
            displayKeywords();
            reloadYouTubeTabs();
        });
    });
}

/**
 * Updates the toggle button text based on the extension's enabled state.
 */
function updateToggleButton() {
    chrome.storage.sync.get({ extensionEnabled: true }, (result) => {
        document.getElementById("toggle-extension").textContent =
            result.extensionEnabled ? "Disable" : "Enable";
    });
}

/**
 * Initializes the popup by displaying keywords and updating the toggle button.
 *
 * @event DOMContentLoaded
 * @listens document
 */
document.addEventListener("DOMContentLoaded", () => {
    displayKeywords();
    updateToggleButton();
});

/**
 * Reloads all YouTube tabs.
 */
function reloadYouTubeTabs() {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
        for (let tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content_script.js"],
            });
        }
    });
}
