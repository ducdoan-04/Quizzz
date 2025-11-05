chrome.commands.onCommand.addListener((command) => {
  if (command === 'capture') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'captureScreenshot' });
    });
  }
});

chrome.runtime.onMessage.addListener((req, sender) => {
  if (req.action === 'captureVisibleRegion') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'processCapturedImage',
        dataUrl,
        rect: req.rect
      });
    });
  }

  if (req.action === 'openGeminiPopup') {
    chrome.action.openPopup();
  }
});
