(async function () {
  console.log('Citations Guide: Content script loaded - VERSION 3.0');

  // Remove any existing dialog elements
  document.querySelectorAll('.citations-guide-dialog-v3').forEach(d => d.remove());

  // Inject CSS for dialog and tail
  const css = `
    .citations-guide-dialog-v3 {
      position: absolute !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      border: 2px solid #000 !important;
      box-shadow: 2px 2px 6px rgba(0,0,0,0.3) !important;
      z-index: 999999 !important;
      max-width: 250px !important;
      background: var(--dialog-bg, #fff) !important;
      color: var(--dialog-color, #000) !important;
      font-family: var(--dialog-font, Arial, sans-serif) !important;
      font-size: var(--dialog-size, 12px) !important;
      font-weight: normal !important;
      line-height: 1.4 !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      pointer-events: none !important;
      min-width: 100px !important;
      min-height: 40px !important;
      white-space: normal !important;
      transition: opacity 0.3s ease !important;
      display: block !important;
    }
    .citations-guide-dialog-v3 .dialog-tail {
      position: absolute;
      width: 0; height: 0;
      border-style: solid;
      z-index: 999999;
    }
    .citations-guide-dialog-v3[data-position="right"] .dialog-tail {
      left: -18px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 10px 18px 10px 0;
      border-color: transparent #000 transparent transparent;
    }
    .citations-guide-dialog-v3[data-position="right"] .dialog-tail-inner {
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 8px 16px 8px 0;
      border-color: transparent var(--dialog-bg, #fff) transparent transparent;
    }
    .citations-guide-dialog-v3[data-position="left"] .dialog-tail {
      right: -18px;
      top: 50%;
      transform: translateY(-50%) scaleX(-1);
      border-width: 10px 18px 10px 0;
      border-color: transparent #000 transparent transparent;
    }
    .citations-guide-dialog-v3[data-position="left"] .dialog-tail-inner {
      right: -16px;
      top: 50%;
      transform: translateY(-50%) scaleX(-1);
      border-width: 8px 16px 8px 0;
      border-color: transparent var(--dialog-bg, #fff) transparent transparent;
    }
    .citations-guide-dialog-v3:hover {
      box-shadow: 3px 3px 8px rgba(0,0,0,0.4) !important;
      transform: translateY(-1px) !important;
    }
  `;
  if (!document.getElementById('citations-guide-style')) {
    const style = document.createElement('style');
    style.id = 'citations-guide-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Helper to apply user settings as CSS variables
  function applyUserSettingsVars(dialog, userStyle) {
    dialog.style.setProperty('--dialog-bg', userStyle?.bgColor || '#fff');
    dialog.style.setProperty('--dialog-color', '#000');
    dialog.style.setProperty('--dialog-font', userStyle?.fontStyle || 'Arial, sans-serif');
    dialog.style.setProperty('--dialog-size', (userStyle?.fontSize || 12) + 'px');
  }

  // Position dialog beside element
  function positionDialog(dialog, el, isRight) {
    const rect = el.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    // Center vertically, offset horizontally
    const top = rect.top + scrollY + rect.height/2 - dialogRect.height/2;
    let left;
    if (isRight) {
      left = rect.right + scrollX + 12;
    } else {
      left = rect.left + scrollX - dialogRect.width - 12;
    }
    dialog.style.top = Math.max(10, top) + 'px';
    dialog.style.left = Math.max(10, left) + 'px';
  }

  // Store dialogs for repositioning
  const dialogs = [];

  // Render all dialogs
  const { enabled, style: userStyle } = await chrome.storage.sync.get(['enabled', 'style']);
  if (!enabled) return;
  const domain = window.location.hostname.replace(/^www\./, '');
  const jsonPath = chrome.runtime.getURL(`selectors/${domain}.json`);
  try {
    const res = await fetch(jsonPath);
    const selectors = await res.json();
    selectors.forEach((sel, index) => {
      const el = document.querySelector(sel.selector);
      if (el && sel.dialogText) {
        const isRight = index % 2 === 0;
        const dialog = document.createElement('div');
        dialog.className = 'citations-guide-dialog-v3';
        dialog.setAttribute('data-position', isRight ? 'right' : 'left');
        dialog.innerHTML = `<span class="dialog-content">${sel.dialogText}</span>`;
        // Add tail (outer and inner for border effect)
        const tail = document.createElement('span');
        tail.className = 'dialog-tail';
        dialog.appendChild(tail);
        const tailInner = document.createElement('span');
        tailInner.className = 'dialog-tail dialog-tail-inner';
        dialog.appendChild(tailInner);
        // Apply user settings
        applyUserSettingsVars(dialog, userStyle);
        document.body.appendChild(dialog);
        positionDialog(dialog, el, isRight);
        dialogs.push({dialog, el, isRight});
      }
    });
  } catch (err) {
    console.warn('Citations Guide: No selector file found:', err.message);
  }

  // Reposition on scroll/resize/zoom
  function repositionAllDialogs() {
    dialogs.forEach(({dialog, el, isRight}) => {
      positionDialog(dialog, el, isRight);
    });
  }
  window.addEventListener('resize', repositionAllDialogs);
  window.addEventListener('scroll', repositionAllDialogs);
  let lastZoom = window.devicePixelRatio;
  setInterval(() => {
    if (window.devicePixelRatio !== lastZoom) {
      lastZoom = window.devicePixelRatio;
      setTimeout(repositionAllDialogs, 100);
    }
  }, 100);

  // Listen for popup settings changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && (changes.enabled || changes.style)) {
      chrome.storage.sync.get(['enabled', 'style'], (result) => {
        dialogs.forEach(({dialog}) => {
          applyUserSettingsVars(dialog, result.style);
        });
        setTimeout(repositionAllDialogs, 50);
      });
    }
  });
})();

