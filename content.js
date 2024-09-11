/**
 * Retrieves keywords and extension enabled state from Chrome storage.
 * If the extension is enabled, sets up a MutationObserver to hide videos
 * containing specified keywords.
 *
 * @param {Object} result - The result object from Chrome storage.
 * @param {Array} result.keywords - The list of keywords to filter videos.
 * @param {boolean} result.extensionEnabled - The state of the extension (enabled/disabled).
 */
chrome.storage.sync.get({ keywords: [], extensionEnabled: true }, (result) => {
    const { keywords, extensionEnabled } = result;
    if (extensionEnabled) {
        /**
         * MutationObserver callback to hide videos containing specified keywords.
         *
         * @param {Array} keywords - The list of keywords to filter videos.
         */
        const observer = new MutationObserver(() => hideVideos(keywords));
        observer.observe(document.body, { childList: true, subtree: true });

        /**
         * Hides videos containing specified keywords.
         *
         * @param {Array} keywords - The list of keywords to filter videos.
         */
        function hideVideos(keywords) {
            const videos = document.querySelectorAll(
                "h3.title, yt-formatted-string"
            );
            videos.forEach((video) => {
                const titleText = video.textContent.toLowerCase();
                keywords.forEach((keyword) => {
                    if (titleText.includes(keyword)) {
                        const videoNode = video.closest(
                            "ytd-video-renderer, ytd-rich-item-renderer"
                        );
                        if (videoNode) {
                            videoNode.style.display = "none";
                        }
                    }
                });
            });
        }

        // Initial call to hide videos based on current keywords
        hideVideos(keywords);
    }
});
