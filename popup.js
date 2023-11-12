console.log('popup.js loaded');

// This function handles the click event
async function handleScrapeClick() {
  console.log('Scrape Courses button clicked');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  console.log('Active tab:', tab);

  if (!tab || !tab.id) {
    console.error('No active tab identified.');
    return;
  }

  if (tab.url.startsWith('chrome://')) {
    console.error('Cannot execute content script on chrome:// pages.');
    alert('This extension cannot be used on chrome:// pages.');
    return;
  }

  try {
    console.log('Executing content script');
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    console.log('Content script executed successfully');
  } catch (error) {
    console.error('Error injecting script: ', error);
  }
}

function login(event) {
  const username = document.getElementById('username').value

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { "message": username });
  });

}

// Function to display scraped data
function displayScrapedData(completedCourses, coursesNeeded) {
  console.log('Displaying scraped data');
  const dataElement = document.getElementById('scraped-data');
  dataElement.textContent = `Completed Courses: ${JSON.stringify(completedCourses)}
    Courses Needed: ${JSON.stringify(coursesNeeded)}`;
  console.log('Scraped data displayed');
}

// Listener for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received from content script:', message);
  displayScrapedData(message.completedCourses, message.coursesNeeded);
  sendResponse({ status: 'Data received by popup!' });
  console.log('Send response back to content script');
});

// Event listener for button click
document.addEventListener('DOMContentLoaded', () => {
  const scrapeButton = document.getElementById('scrape-courses');
  if (!scrapeButton) {
    console.error('Scrape button not found');
    return;
  }
  scrapeButton.addEventListener('click', handleScrapeClick);
});

const highlightButton = document.getElementById('highlight-courses');

async function highlightCourses() {
  console.log('Highlight Courses button clicked');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url !== 'https://enroll.wisc.edu/search?subject=266') {
    console.log('Not on the correct page');
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['highlightCoursesScript.js'],
    });
  }
}
highlightButton.addEventListener('click', highlightCourses);

const usernameForm = document.getElementById('username-form')

usernameForm.addEventListener('submit', login)

// In popup.js


