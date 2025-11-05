chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'captureScreenshot') {
    chrome.runtime.sendMessage({ action: 'captureScreenshot' });
  }
});
