// degreeAuditContentScript.js
const scrapeCompletedCourses = () => {
    const completedCourses = [];
    const courseRows = document.querySelectorAll('tr.mat-mdc-row.mdc-data-table__row.cdk-row.ng-star-inserted');

    courseRows.forEach(row => {
      const term = row.querySelector('.mat-column-term span:last-child').textContent.trim();
      const course = row.querySelector('.mat-column-course span:last-child').textContent.trim();
      const credits = row.querySelector('.mat-column-credits span:last-child').textContent.trim();
      const grade = row.querySelector('.mat-column-grade span:last-child').textContent.trim();
      const title = row.querySelector('.mat-column-title span:last-child').textContent.trim();

      completedCourses.push({ term, course, credits, grade, title });
    });

    // Store completed courses in local storage for later use
    chrome.storage.local.set({ completedCourses }, () => {
      console.log('Completed courses have been saved.');
    });
  };

  // Run the scraping function when the page is fully loaded
  window.addEventListener('load', scrapeCompletedCourses);
