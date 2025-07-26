document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const fontStyle = document.getElementById('fontStyle');
  const bgColor = document.getElementById('bgColor');
  const fontSize = document.getElementById('fontSize');

  chrome.storage.sync.get(['enabled', 'style'], (res) => {
    toggle.checked = res.enabled || false;
    fontStyle.value = res.style?.fontStyle || 'sans-serif';
    bgColor.value = res.style?.bgColor || '#ffffff';
    fontSize.value = res.style?.fontSize || 12;
  });

  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });

  [fontStyle, bgColor, fontSize].forEach(el =>
    el.addEventListener('change', () => {
      chrome.storage.sync.set({
        style: {
          fontStyle: fontStyle.value,
          bgColor: bgColor.value,
          fontSize: fontSize.value
        }
      });
    })
  );
});
