(async function () {
  console.log('CB Guide Toolkit: Content script loaded - VERSION 4.0');

  // Remove any existing dialog elements
  document.querySelectorAll('.citations-guide-dialog-v3').forEach(d => d.remove());
  document.querySelectorAll('.citations-guide-general-dialog').forEach(d => d.remove());

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
    
    /* General Dialog Styles */
    .citations-guide-general-dialog {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      width: 300px !important;
      max-height: 400px !important;
      background: var(--dialog-bg, #fff) !important;
      border: 2px solid #000 !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
      z-index: 1000000 !important;
      font-family: var(--dialog-font, Arial, sans-serif) !important;
      font-size: var(--dialog-size, 12px) !important;
      color: var(--dialog-color, #000) !important;
      display: flex !important;
      flex-direction: column !important;
      cursor: move !important;
      user-select: none !important;
      overflow: hidden !important;
    }
    .citations-guide-general-dialog .dialog-header {
      background: #f0f0f0 !important;
      padding: 8px 12px !important;
      border-bottom: 1px solid #ccc !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      font-weight: bold !important;
    }
    .citations-guide-general-dialog .dialog-content {
      padding: 12px !important;
      flex: 1 !important;
      overflow-y: auto !important;
      line-height: 1.4 !important;
    }
    .citations-guide-general-dialog .dialog-footer {
      padding: 8px 12px !important;
      border-top: 1px solid #ccc !important;
      background: #f8f8f8 !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
    .citations-guide-general-dialog .nav-button {
      background: #007bff !important;
      color: white !important;
      border: none !important;
      padding: 4px 8px !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      font-size: 11px !important;
    }
    .citations-guide-general-dialog .nav-button:hover {
      background: #0056b3 !important;
    }
    .citations-guide-general-dialog .nav-button:disabled {
      background: #ccc !important;
      cursor: not-allowed !important;
    }
    .citations-guide-general-dialog .close-button {
      background: #dc3545 !important;
      color: white !important;
      border: none !important;
      padding: 2px 6px !important;
      border-radius: 3px !important;
      cursor: pointer !important;
      font-size: 10px !important;
    }
    .citations-guide-general-dialog .close-button:hover {
      background: #c82333 !important;
    }
    .citations-guide-general-dialog .group-indicator {
      font-size: 11px !important;
      color: #666 !important;
    }
    .citations-guide-general-dialog.hidden {
      display: none !important;
    }
  `;
  if (!document.getElementById('citations-guide-style')) {
    const style = document.createElement('style');
    style.id = 'citations-guide-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Helper to apply user settings as CSS variables
  function applyUserSettingsVars(element, userStyle) {
    element.style.setProperty('--dialog-bg', userStyle?.bgColor || '#fff');
    element.style.setProperty('--dialog-color', '#000');
    element.style.setProperty('--dialog-font', userStyle?.fontStyle || 'Arial, sans-serif');
    element.style.setProperty('--dialog-size', (userStyle?.fontSize || 12) + 'px');
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
  const generalDialogs = [];

  // Get selector configuration from background script
  async function getSelectorConfig(domain) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSelectorConfig',
        domain: domain
      });
      
      if (response.success) {
        return response.config;
      } else {
        console.error('CB Guide Toolkit: Failed to get config:', response.error);
        return null;
      }
    } catch (error) {
      console.error('CB Guide Toolkit: Error requesting config:', error);
      return null;
    }
  }

  // Create general dialog with navigation
  function createGeneralDialog(groups, userStyle) {
    let currentGroupIndex = 0;
    
    const dialog = document.createElement('div');
    dialog.className = 'citations-guide-general-dialog';
    dialog.setAttribute('data-group-index', currentGroupIndex);
    
    // Apply user settings
    applyUserSettingsVars(dialog, userStyle);
    
    // Create header
    const header = document.createElement('div');
    header.className = 'dialog-header';
    header.innerHTML = `
      <span>Instructions</span>
      <button class="close-button" title="Hide dialog">×</button>
    `;
    
    // Create content
    const content = document.createElement('div');
    content.className = 'dialog-content';
    
    // Create footer with navigation
    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    
    const updateDialog = () => {
      const currentGroup = groups[currentGroupIndex];
      if (currentGroup) {
        content.innerHTML = currentGroup.dialogText || 'No instructions available';
        footer.innerHTML = `
          <button class="nav-button prev-btn" ${currentGroupIndex === 0 ? 'disabled' : ''}>← Previous</button>
          <span class="group-indicator">Group ${currentGroupIndex + 1} of ${groups.length}</span>
          <button class="nav-button next-btn" ${currentGroupIndex === groups.length - 1 ? 'disabled' : ''}>Next →</button>
        `;
        
        // Add event listeners for navigation
        const prevBtn = footer.querySelector('.prev-btn');
        const nextBtn = footer.querySelector('.next-btn');
        
        prevBtn.addEventListener('click', () => {
          if (currentGroupIndex > 0) {
            currentGroupIndex--;
            dialog.setAttribute('data-group-index', currentGroupIndex);
            updateDialog();
          }
        });
        
        nextBtn.addEventListener('click', () => {
          if (currentGroupIndex < groups.length - 1) {
            currentGroupIndex++;
            dialog.setAttribute('data-group-index', currentGroupIndex);
            updateDialog();
          }
        });
      }
    };
    
    // Add close button functionality
    header.querySelector('.close-button').addEventListener('click', () => {
      dialog.classList.add('hidden');
    });
    
    // Make dialog draggable
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = dialog.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      dialog.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        // Keep dialog within viewport bounds
        const maxX = window.innerWidth - dialog.offsetWidth;
        const maxY = window.innerHeight - dialog.offsetHeight;
        
        dialog.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        dialog.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dialog.style.cursor = 'move';
      }
    });
    
    // Assemble dialog
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    // Initialize content
    updateDialog();
    
    return dialog;
  }

  // Render all dialogs
  const { enabled, style: userStyle } = await chrome.storage.sync.get(['enabled', 'style']);
  if (!enabled) return;
  
  const domain = window.location.hostname.replace(/^www\./, '');
  console.log('CB Guide Toolkit: Current domain:', domain);
  
  // Get selector configuration from background script
  const selectors = await getSelectorConfig(domain);
  if (!selectors) {
    console.warn('CB Guide Toolkit: No selector config found for domain:', domain);
    return;
  }
  
  console.log('CB Guide Toolkit: Found selectors:', selectors.length);

  // Separate general dialogs and regular selectors
  const generalGroups = [];
  const regularSelectors = [];
  
  selectors.forEach((item, index) => {
    if (item.general) {
      // This is a general instruction group
      generalGroups.push(item);
    } else if (item.selector) {
      // This is a regular selector
      regularSelectors.push(item);
    }
  });

  // Create general dialog if groups exist
  if (generalGroups.length > 0) {
    const generalDialog = createGeneralDialog(generalGroups, userStyle);
    document.body.appendChild(generalDialog);
    generalDialogs.push(generalDialog);
    console.log('CB Guide Toolkit: Created general dialog with', generalGroups.length, 'groups');
  }

  // Create regular dialogs
  regularSelectors.forEach((sel, index) => {
    const el = document.querySelector(sel.selector);
    console.log(`CB Guide Toolkit: Selector ${index}:`, sel.selector, 'Found:', !!el);
    
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
        // Update regular dialogs
        dialogs.forEach(({dialog}) => {
          applyUserSettingsVars(dialog, result.style);
        });
        
        // Update general dialogs
        generalDialogs.forEach(dialog => {
          applyUserSettingsVars(dialog, result.style);
        });
        
        setTimeout(repositionAllDialogs, 50);
      });
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showGeneralDialog') {
      // Show any hidden general dialogs
      generalDialogs.forEach(dialog => {
        dialog.classList.remove('hidden');
      });
      
      if (generalDialogs.length === 0) {
        console.log('CB Guide Toolkit: No general dialogs found to show');
      } else {
        console.log('CB Guide Toolkit: Showing general dialogs');
      }
      
      sendResponse({ success: true });
    }
  });
})();

