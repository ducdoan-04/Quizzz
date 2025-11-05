chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'captureScreenshot' });
    });
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'captureScreenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        console.error('Lỗi chụp ảnh:', chrome.runtime.lastError);
        return;
      }
      chrome.runtime.sendMessage({
        action: 'screenshotCaptured',
        dataUrl: dataUrl
      });
    });
  }
});

// Mở popup khi nhận tin từ nút nổi Gemini
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'openGeminiPopup') {
    // Gọi chrome.action.openPopup() để mở popup.html của extension
    if (chrome.action && typeof chrome.action.openPopup === 'function') {
      chrome.action.openPopup();
    } else if (chrome.browserAction && typeof chrome.browserAction.openPopup === 'function') {
      // fallback cho manifest v2 / older APIs (harmless if not present)
      chrome.browserAction.openPopup();
    } else {
      console.warn('openPopup API không khả dụng trong runtime này.');
    }
  }
});
