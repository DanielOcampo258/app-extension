console.log('background.js loaded');

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('background.js: Message received', message);
  // Forward message from content script to popup
  chrome.runtime.sendMessage(message);
  console.log('background.js: Message forwarded to popup');
});
