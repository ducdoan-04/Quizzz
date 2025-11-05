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
