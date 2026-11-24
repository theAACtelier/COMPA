chrome.action.onClicked.addListener(() => {
  chrome.windows.create({ url: chrome.runtime.getURL('panel.html') });
});
