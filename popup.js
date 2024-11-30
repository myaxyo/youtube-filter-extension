/**
 * Reloads all YouTube tabs.
 */
function reloadYouTubeTabs() {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
        for (let tab of tabs) {
            chrome.tabs.reload(tab.id);
        }
    });
}

/**
 * Adds a keyword to the storage and updates the UI.
 * Reloads YouTube tabs to apply new keywords.
 */
document.getElementById("add-keyword").addEventListener("click", () => {
    const input = document.getElementById("keyword-input");
    const keyword = input.value.trim().toLowerCase();
    if (keyword) {
        chrome.storage.sync.get({ keywords: [] }, (result) => {
            const { keywords } = result;
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                keywords.sort(); // Sort keywords alphabetically
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
 */
document.getElementById("reset-keywords").addEventListener("click", () => {
    // chrome.storage.sync.set({ keywords: [] }, () => {
    //     const list = document.getElementById("keyword-list");
    //     list.innerHTML = "";
    //     reloadYouTubeTabs(); // Reload YouTube tabs on reset
    // });
    const confirmReset = confirm("Are you sure you want to reset all keywords?");

    if (confirmReset) {

        chrome.storage.sync.set({ keywords: [] }, () => {

            const list = document.getElementById("keyword-list");

            list.innerHTML = "";

            updateKeywordCount(); // Update keyword count

            reloadYouTubeTabs(); // Reload YouTube tabs on reset

        });

    }
});

/**
 * Toggles the extension's enabled state and updates the UI.
 * Reloads YouTube tabs to apply the change.
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

function displayKeywords() {
    chrome.storage.sync.get({ keywords: [] }, (result) => {
        const list = document.getElementById("keyword-list");
        list.innerHTML = ""; // Clear existing list

        result.keywords.forEach((keyword) => {
            // Create list item
            const item = document.createElement("li");
            item.className = "keyword-item";

            // Keyword text
            const span = document.createElement("span");
            span.textContent = keyword;

            // Remove button
            const removeButton = document.createElement("button");
            removeButton.textContent = "❌";
            removeButton.className = "remove-button";
            removeButton.addEventListener("click", () => removeKeyword(keyword));

            // Append elements
            item.appendChild(span);
            item.appendChild(removeButton);
            list.appendChild(item);
        });
        updateKeywordCount(); // Update the count of keywords
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

// /**
//  * Initializes the popup by displaying keywords and updating the toggle button.
//  */
// document.addEventListener("DOMContentLoaded", () => {
//     displayKeywords();
//     updateToggleButton();
// });

/**

 * Updates the displayed count of keywords.

 */

function updateKeywordCount() {

    chrome.storage.sync.get({ keywords: [] }, (result) => {

        const countElement = document.getElementById("keyword-count");

        countElement.textContent = `Keywords: ${result.keywords.length}`;

    });

}



/**

 * Exports keywords to a text file.

 */

document.getElementById("export-keywords").addEventListener("click", () => {

    chrome.storage.sync.get({ keywords: [] }, (result) => {

        const blob = new Blob([result.keywords.join("\n")], { type: "text/plain" });

        const url = URL.createObjectURL(blob);



        const a = document.createElement("a");

        a.href = url;

        a.download = "keywords.txt";

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    });

});



/**

 * Initializes the popup by displaying keywords, updating the toggle button, and setting up the keyword count.

 */

document.addEventListener("DOMContentLoaded", () => {

    displayKeywords();

    updateToggleButton();

    updateKeywordCount();

});