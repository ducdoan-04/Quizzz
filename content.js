if (!document.getElementById('gemini-float-btn')) {
  const btn = document.createElement('div');
  btn.id = 'gemini-float-btn';
  btn.innerHTML = `<span class="emoji">🧠</span><span class="label">Hỏi Gemini</span>`;
  document.body.appendChild(btn);

  const style = document.createElement('style');
  style.textContent = `
    #gemini-float-btn {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background: #1a73e8;
      color: white;
      font-weight: 500;
      font-family: 'Segoe UI', sans-serif;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      height: 45px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: float 2.5s ease-in-out infinite;
      overflow: hidden;
      width: 45px;
    }
    #gemini-float-btn:hover {
      width: 130px;
      background: #1557b0;
    }
    #gemini-float-btn .label {
      opacity: 0;
      white-space: nowrap;
      margin-left: 6px;
      transition: opacity 0.3s;
    }
    #gemini-float-btn:hover .label {
      opacity: 1;
    }
    @keyframes float {
      0%, 100% { transform: translateY(-50%) translateX(0); }
      50% { transform: translateY(-52%) translateX(-2px); }
    }

    #gemini-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 999998;
      display: none;
      cursor: crosshair;
    }
    #gemini-selection {
      position: fixed;
      border: 2px dashed #1a73e8;
      background: rgba(26,115,232,0.15);
      z-index: 999999;
      display: none;
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <div id="gemini-overlay"></div>
    <div id="gemini-selection"></div>
  `);

  const overlay = document.getElementById('gemini-overlay');
  const selection = document.getElementById('gemini-selection');
  let startX, startY, endX, endY, selecting = false;

  btn.addEventListener('click', () => {
    overlay.style.display = 'block';
    selection.style.display = 'none';
    alert('🖱️ Kéo chuột để chọn vùng muốn chụp.');

    const onMouseDown = (e) => {
      selecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selection.style.display = 'block';
      selection.style.left = `${startX}px`;
      selection.style.top = `${startY}px`;
      selection.style.width = `0px`;
      selection.style.height = `0px`;
    };

    const onMouseMove = (e) => {
      if (!selecting) return;
      endX = e.clientX;
      endY = e.clientY;
      selection.style.left = `${Math.min(startX, endX)}px`;
      selection.style.top = `${Math.min(startY, endY)}px`;
      selection.style.width = `${Math.abs(endX - startX)}px`;
      selection.style.height = `${Math.abs(endY - startY)}px`;
    };

    const onMouseUp = () => {
      selecting = false;
      overlay.style.display = 'none';
      selection.style.display = 'none';
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      chrome.runtime.sendMessage({
        action: 'captureVisibleRegion',
        rect: {
          x: Math.min(startX, endX),
          y: Math.min(startY, endY),
          width: Math.abs(endX - startX),
          height: Math.abs(endY - startY)
        }
      });
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// === Xử lý ảnh cắt vùng ===
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === 'processCapturedImage') {
    const img = new Image();
    img.src = req.dataUrl;
    img.onload = () => {
      const ratio = window.devicePixelRatio || 1;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = req.rect.width * ratio;
      canvas.height = req.rect.height * ratio;
      ctx.drawImage(
        img,
        req.rect.x * ratio,
        req.rect.y * ratio,
        req.rect.width * ratio,
        req.rect.height * ratio,
        0, 0,
        canvas.width, canvas.height
      );
      const cropped = canvas.toDataURL('image/png');
      chrome.runtime.sendMessage({
        action: 'screenshotCaptured',
        dataUrl: cropped
      });
    };
  }
});
