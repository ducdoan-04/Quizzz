const screenshotBtn = document.getElementById('screenshotBtn');
const askBtn = document.getElementById('askBtn');
const queryInput = document.getElementById('queryInput');
const resultDiv = document.getElementById('result');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const apiKeyInput = document.getElementById('apiKeyInput');

let GEMINI_API_KEY = '';
let currentImage = null;

// 🔹 Tải key khi mở popup
chrome.storage.sync.get(['geminiApiKey'], (result) => {
  if (result.geminiApiKey) {
    GEMINI_API_KEY = result.geminiApiKey;
    apiKeyInput.value = GEMINI_API_KEY;
  }
});

// 🔹 Lưu key
saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key.startsWith('AIza')) {
    alert('❌ API key không hợp lệ. Hãy dán key bắt đầu bằng "AIza..."');
    return;
  }
  chrome.storage.sync.set({ geminiApiKey: key }, () => {
    GEMINI_API_KEY = key;
    alert('✅ Đã lưu API key thành công!');
  });
});

// 🔹 Chụp ảnh
screenshotBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'captureScreenshot' });
});

// 🔹 Gửi câu hỏi
askBtn.addEventListener('click', async () => {
  if (!GEMINI_API_KEY) {
    alert('⚠️ Vui lòng nhập và lưu API key trước khi hỏi.');
    return;
  }
  const query = queryInput.value.trim();
  if (!query && !currentImage) {
    resultDiv.innerHTML = '<span style="color:red">⚠️ Vui lòng nhập câu hỏi hoặc chụp ảnh!</span>';
    return;
  }

  resultDiv.innerHTML = '<div class="loading">⏳ Đang hỏi Gemini...</div>';

  if (currentImage && !query) {
    analyzeImage(currentImage);
  } else if (currentImage && query) {
    analyzeImage(currentImage, query);
  } else {
    askTextOnly(query);
  }
});

// 🔹 Nhận ảnh chụp từ background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'screenshotCaptured') {
    currentImage = request.dataUrl;
    resultDiv.innerHTML = `<img src="${currentImage}" style="max-width:100%; border-radius:6px;"><br><i>Ảnh đã chụp — sẵn sàng gửi cho Gemini.</i>`;
  }
});

// 🔹 Gửi văn bản
async function askTextOnly(text) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Lỗi API');
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ Không có phản hồi.';
    showResult(answer);
  } catch (err) {
    showResult(`❌ Lỗi: ${err.message}`, true);
  }
}

// 🔹 Phân tích ảnh
async function analyzeImage(imageBase64, userText = '') {
  const base64Data = imageBase64.split(',')[1];
  const prompt = userText
    ? `Giải thích hoặc giải bài tập trong ảnh. Câu hỏi: "${userText}".`
    : `Phân tích và giải bài tập trong ảnh, trình bày chi tiết, có công thức nếu cần.`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/png', data: base64Data } }
          ]
        }]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Lỗi phân tích ảnh');
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ Không có phản hồi.';
    showResult(answer, false, imageBase64);
  } catch (err) {
    showResult(`❌ Lỗi: ${err.message}`, true);
  }
}

// 🔹 Hiển thị kết quả
function showResult(text, isError = false, img = null) {
  let html = '';
  if (img) html += `<img src="${img}" style="max-width:100%; border-radius:6px;">`;
  html += `<div style="color:${isError ? 'red' : '#333'}">${text.replace(/\n/g, '<br>')}</div>`;
  html += `<button style="margin-top:8px; background:#34a853; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;" onclick="navigator.clipboard.writeText(\`${text}\`)">📋 Sao chép</button>`;
  resultDiv.innerHTML = html;
}
