chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'captureScreenshot') {
    chrome.runtime.sendMessage({ action: 'captureScreenshot' });
  }
});

// === Nút nổi của Gemini Helper ===
const existingBtn = document.getElementById('gemini-float-btn');
if (!existingBtn) {
  const btn = document.createElement('div');
  btn.id = 'gemini-float-btn';
  btn.innerHTML = '🧠';
  Object.assign(btn.style, {
    position: 'fixed',
    top: '50%',
    right: '0',
    transform: 'translateY(-50%)',
    background: '#1a73e8',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '99999',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
  });
  btn.onmouseenter = () => btn.style.width = '55px';
  btn.onmouseleave = () => btn.style.width = '40px';

  document.body.appendChild(btn);

  // Khi bấm -> mở popup hỏi Gemini
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openGeminiPopup' });
  });
}
