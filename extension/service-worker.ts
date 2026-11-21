chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
})

chrome.action.onClicked.addListener(async () => {
  const window = await chrome.windows.getCurrent()
  if (window.id !== undefined) {
    await chrome.sidePanel.open({ windowId: window.id })
  }
})
