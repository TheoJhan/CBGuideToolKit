document.addEventListener('DOMContentLoaded', async function() {
  const toggle = document.getElementById('toggle');
  const fontStyle = document.getElementById('fontStyle');
  const bgColor = document.getElementById('bgColor');
  const fontSize = document.getElementById('fontSize');
  const lastUpdate = document.getElementById('lastUpdate');
  const updateBtn = document.getElementById('updateBtn');
  const showDialogBtn = document.getElementById('showDialogBtn');

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'style'], function(result) {
    toggle.checked = result.enabled !== false;
    if (result.style) {
      fontStyle.value = result.style.fontStyle || 'sans-serif';
      bgColor.value = result.style.bgColor || '#ffffff';
      fontSize.value = result.style.fontSize || 12;
    }
  });

  // Save settings on change
  toggle.addEventListener('change', function() {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });

  fontStyle.addEventListener('change', function() {
    chrome.storage.sync.get(['style'], function(result) {
      const style = result.style || {};
      style.fontStyle = fontStyle.value;
      chrome.storage.sync.set({ style: style });
    });
  });

  bgColor.addEventListener('change', function() {
    chrome.storage.sync.get(['style'], function(result) {
      const style = result.style || {};
      style.bgColor = bgColor.value;
      chrome.storage.sync.set({ style: style });
    });
  });

  fontSize.addEventListener('change', function() {
    chrome.storage.sync.get(['style'], function(result) {
      const style = result.style || {};
      style.fontSize = parseInt(fontSize.value);
      chrome.storage.sync.set({ style: style });
    });
  });

  // Load sync status
  async function loadSyncStatus() {
    try {
      // Get the most recent update time from any stored config
      const response = await chrome.runtime.sendMessage({
        action: 'getLastUpdateTime'
      });
      
      if (response.success && response.lastUpdate) {
        const date = new Date(response.lastUpdate);
        lastUpdate.textContent = `Last update: ${date.toLocaleString()}`;
      } else {
        lastUpdate.textContent = 'Last update: Never';
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
      lastUpdate.textContent = 'Last update: Error loading';
    }
  }

  // Handle manual update
  updateBtn.addEventListener('click', async function() {
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'forceUpdate'
      });
      
      if (response.success) {
        updateBtn.textContent = 'Updated!';
        setTimeout(() => {
          updateBtn.textContent = 'Update Now';
          updateBtn.disabled = false;
        }, 2000);
        
        // Reload sync status
        await loadSyncStatus();
      } else {
        updateBtn.textContent = 'Error!';
        setTimeout(() => {
          updateBtn.textContent = 'Update Now';
          updateBtn.disabled = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating:', error);
      updateBtn.textContent = 'Error!';
      setTimeout(() => {
        updateBtn.textContent = 'Update Now';
        updateBtn.disabled = false;
      }, 2000);
    }
  });

  // Handle show general dialog
  showDialogBtn.addEventListener('click', async function() {
    showDialogBtn.disabled = true;
    showDialogBtn.textContent = 'Showing...';
    
    try {
      // Send message to current tab to show general dialog
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showGeneralDialog'
        });
        
        showDialogBtn.textContent = 'Shown!';
        setTimeout(() => {
          showDialogBtn.textContent = 'Show General Dialog';
          showDialogBtn.disabled = false;
        }, 2000);
      } else {
        showDialogBtn.textContent = 'No Tab Found';
        setTimeout(() => {
          showDialogBtn.textContent = 'Show General Dialog';
          showDialogBtn.disabled = false;
        }, 2000);
      }
    } catch (error) {
      console.error('Error showing dialog:', error);
      showDialogBtn.textContent = 'Error!';
      setTimeout(() => {
        showDialogBtn.textContent = 'Show General Dialog';
        showDialogBtn.disabled = false;
      }, 2000);
    }
  });

  // Load initial sync status
  loadSyncStatus();
});
