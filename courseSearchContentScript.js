// courseSearchContentScript.js
const highlightCourses = () => {
    chrome.storage.local.get(['completedCourses'], data => {
      if (!data.completedCourses) {
        console.error('No completed course data available.');
        return;
      }

      const completedCourses = data.completedCourses;
      const courseElements = document.querySelectorAll('cse-detail-topic');

      courseElements.forEach(element => {
        const requisites = element.querySelector('p').textContent.trim();
        // You'll need to implement the logic to parse and match requisites here
        const isPrerequisiteMet = checkPrerequisites(requisites, completedCourses);

        element.style.backgroundColor = isPrerequisiteMet ? 'green' : 'red';
      });
    });
  };

  // Dummy function for checking prerequisites - this needs proper implementation
  const checkPrerequisites = (requisites, completedCourses) => {
    // Implement the logic to check if the prerequisites in the 'requisites' string
    // are met by the 'completedCourses' array entries
    // This is a placeholder and requires actual logic
    return true;
  };

  // Run the highlighting function when the page is fully loaded
  window.addEventListener('load', highlightCourses);


  // courseSearchContentScript.js
const highlightCourses = () => {
  chrome.storage.local.get(['completedCourses'], data => {
    if (!data.completedCourses) {
      console.error('No completed course data available.');
      return;
    }

    const completedCourses = data.completedCourses;
    const courseElements = document.querySelectorAll('cse-detail-topic');

    courseElements.forEach(element => {
      const requisites = element.querySelector('p').textContent.trim();
      // You'll need to implement the logic to parse and match requisites here
      const isPrerequisiteMet = checkPrerequisites(requisites, completedCourses);

      element.style.backgroundColor = isPrerequisiteMet ? 'green' : 'red';
    });
  });
};

// Dummy function for checking prerequisites - this needs proper implementation
const checkPrerequisites = (requisites, completedCourses) => {
  // Implement the logic to check if the prerequisites in the 'requisites' string
  // are met by the 'completedCourses' array entries
  // This is a placeholder and requires actual logic
  return true;
};

// Run the highlighting function when the page is fully loaded
window.addEventListener('load', highlightCourses);
