// content.js
// Content script to scrape courses from the DARS page

mainScrapeFunction();


// Function to extract course details from a row
function extractCourseDetails(row) {
  console.log('extractCourseDetails started', row);
  const term = row.querySelector('.mat-column-term').textContent.trim();
  const course = row.querySelector('.mat-column-course').textContent.trim();
  const credits = row.querySelector('.mat-column-credits').textContent.trim();
  const grade = row.querySelector('.mat-column-grade').textContent.trim();
  const title = row.querySelector('.mat-column-title').textContent.trim();
  console.log('extractCourseDetails completed', { term, course, credits, grade, title });

  return { term, course, credits, grade, title };
}

// Function to scrape completed courses
function scrapeCompletedCourses() {
  console.log('scrapeCompletedFunction')
  const completedCourses = [];
  const courseRows = document.querySelectorAll('table.mat-mdc-table tbody tr.mat-mdc-row');

  console.log('Scraping completed courses...'); // Add this line

  courseRows.forEach(row => {
    if (!row.textContent.includes('NEEDS:') && !row.textContent.includes('SELECT FROM:')) {
      completedCourses.push(extractCourseDetails(row));
    }
  });

  return completedCourses;
}

// Function to scrape courses still needed
function scrapeCoursesNeeded() {
  console.log('scrapeCoursedNeeded');
  const coursesNeeded = [];
  const neededTextBlocks = document.querySelectorAll('.subrequirement-content-wrapper p');

  neededTextBlocks.forEach(block => {
    const textContent = block.textContent.trim();
    if (textContent.startsWith('SELECT FROM:')) {
      const courses = textContent.replace('SELECT FROM:', '').split(',').map(course => course.trim());
      coursesNeeded.push(...courses);
    }
  });

  return coursesNeeded;
}

// Function to send data to the popup
function sendDataToPopup(data) {
  console.log('Sending data to popup:', data);
  chrome.runtime.sendMessage(data);
}

// Main function to initiate scraping
function mainScrapeFunction() {
  console.log('Main scraping function initiated');
  const completedCourses = scrapeCompletedCourses();
  const coursesNeeded = scrapeCoursesNeeded();
  sendDataToPopup({ completedCourses, coursesNeeded });
  console.log('Data sent to popup');
}




// content.js
// Content script to scrape courses from the DARS page

function extractCourseDetails(row) {
  console.log('extractCourseDetails started', row);

  // Check if the row is a standard course row
  const descriptionCell = row.querySelector('.mat-column-description');
  if (descriptionCell && descriptionCell.textContent.trim() === "Waive course") {
      console.log('Row does not contain course details, skipping...');
      return null; // Skip this row as it doesn't contain course details
  }

  // Helper function to safely extract text content from a selector
  const safeText = (selector) => {
      const el = row.querySelector(selector);
      return el && el.textContent ? el.textContent.trim() : '';
  };

  // Extract the details using the helper function
  const term = safeText('.mat-column-term');
  const course = safeText('.mat-column-course');
  const credits = safeText('.mat-column-credits');
  const grade = safeText('.mat-column-grade');
  const title = safeText('.mat-column-title');

  // Log the extracted details
  console.log('extractCourseDetails completed', { term, course, credits, grade, title });

  return { term, course, credits, grade, title };
}


// Function to reformat and filter COMP SCI courses
function formatCompSciCourses(coursesNeeded) {
  const compSciCourses = [];
  for (let i = 0; i < coursesNeeded.length; i++) {
    // If 'COMP' is found, expect the next one to be 'SCI' and then a course number
    if (coursesNeeded[i] === 'COMP' && coursesNeeded[i+1] === 'SCI') {
      const courseNumber = coursesNeeded[i+2];
      if (courseNumber) {
        compSciCourses.push(`COMP SCI ${courseNumber}`);
        i += 2; // Skip the next two entries ('SCI' and the course number)
      }
    }
  }
  return compSciCourses;
}

function scrapeCompletedCourses() {
  const completedCourses = [];
  const courseRows = document.querySelectorAll('table.mat-mdc-table tbody tr.mat-mdc-row');

  courseRows.forEach(row => {
    const courseDetail = extractCourseDetails(row);
    if (courseDetail) {
      completedCourses.push(courseDetail);
    }
  });

  console.log('Completed courses:', completedCourses);
  return completedCourses;
}

// Now, call scrapeCompletedCourses and ensure the output is logged
const completedCourses = scrapeCompletedCourses();
console.log('Final list of completed courses:', completedCourses);

function scrapeCoursesNeeded() {
  console.log('scrapeCoursesNeeded function started');
  const coursesNeeded = [];
  const neededTextBlocks = document.querySelectorAll('.subrequirement-content-wrapper p');
  console.log(`Found ${neededTextBlocks.length} '.subrequirement-content-wrapper p' elements`);

  let currentLabel = ''; // To keep track of the current label (e.g., 'COMP SCI')

  neededTextBlocks.forEach(block => {
    let textContent = block.textContent.trim();
    console.log(`Text content of p element:`, textContent);

    // Split the text by commas, spaces, and 'OR'
    const courseParts = textContent.split(/,|\sOR\s|\s+/).map(part => part.trim());

    courseParts.forEach(part => {
      if (part === 'COMP' && currentLabel !== 'COMP SCI') {
        // If 'COMP' is encountered and the current label is not already 'COMP SCI'
        currentLabel = 'COMP SCI'; // Update the current label to 'COMP SCI'
      } else if (part.match(/^[A-Z]+$/) && part !== 'SCI' && currentLabel !== '') {
        // If a new subject label is encountered that is not 'SCI' and there was a previous label
        currentLabel = ''; // Reset the current label
      } else if (part.match(/^\d+$/) && currentLabel === 'COMP SCI') {
        // If a course number is encountered and the current label is 'COMP SCI'
        coursesNeeded.push(`${currentLabel} ${part}`); // Add 'COMP SCI' label to the course number
      } else if (part.match(/^\d+$/) && currentLabel === '') {
        // If a course number is encountered with no current label
        // Handle other subjects or standalone course numbers if needed
      }
    });
  });

  console.log('CS Courses Still Needed to Complete Major:', coursesNeeded);
  return coursesNeeded;
}

// Example usage:
const coursesNeeded = scrapeCoursesNeeded();
console.log('Final list of courses still needed:', coursesNeeded);

// Function to send data to the popup
function sendDataToPopup(data) {
  console.log('Sending data to popup:', data);
  chrome.runtime.sendMessage(data);
}

// Function to filter out duplicates and non-empty values
function uniqueNonEmptyCourses(courses) {
  const unique = new Set();
  return courses.filter(course => {
    const isNonEmpty = course.term.trim() && course.course.trim() && course.title.trim();
    const courseKey = `${course.term}-${course.course}-${course.title}`;
    const isDuplicate = unique.has(courseKey);
    if (isNonEmpty && !isDuplicate) {
      unique.add(courseKey);
      return true;
    }
    return false;
  });
}

function postCompletedCourses(username, takenCourses, requiredCourses) {
  // Prepare the data to be sent in the POST request
  const postData = {
    username: username,
    taken: takenCourses.map(course => course.replace('COMP SCI ', '')), // Convert 'COMP SCI XXX' to 'XXX'
    required: requiredCourses.map(course => course.replace('COMP SCI ', '')) // Convert 'COMP SCI XXX' to 'XXX'
  };

  // Use the fetch API to make the POST request
  fetch("http://10.140.104.130:5000/create_dars", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData) // Convert the JavaScript object to a JSON string
  })
  .then(response => response.json()) // Parse the JSON response
  .then(data => console.log('Success:', data)) // Log success message and data
  .catch(error => console.error('Error:', error)); // Log any errors
}

// Main function to initiate scraping
function mainScrapeFunction() {
    console.log('Main scraping function initiated');
    let completedCourses = scrapeCompletedCourses();
    let coursesNeeded = scrapeCoursesNeeded();

    // Filter out duplicates and empty values
    completedCourses = uniqueNonEmptyCourses(completedCourses);
    coursesNeeded = coursesNeeded.filter(course => course.trim().length > 0); // Assuming coursesNeeded is an array of strings

    const compSciCoursesNeeded = formatCompSciCourses(coursesNeeded);
console.log('COMP SCI Courses still needed:', compSciCoursesNeeded.join(', '));
    // Log the completed courses
    console.log('Completed courses:', completedCourses.map(course => `${course.term} - ${course.course} - ${course.title}`).join('\n'));

    console.log('Data sent to popup and logged to console');
}

// Invoke the main scrape function according to the document's state
if (document.readyState === "complete" || document.readyState === "interactive") {
    mainScrapeFunction();
} else {
    window.addEventListener('DOMContentLoaded', mainScrapeFunction);
}


// Call mainScrapeFunction at an appropriate time, such as after the DOM is fully loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
  mainScrapeFunction();
} else {
  window.addEventListener('DOMContentLoaded', mainScrapeFunction);
}


// Try to scrape immediately if the document is already loaded, or wait for the event
function tryScrape() {
if (document.readyState === "complete" || document.readyState === "interactive") {
  mainScrapeFunction();
} else {
  document.addEventListener('DOMContentLoaded', mainScrapeFunction);
}
}

function filterAndFormatCompSciCourses(completedCourses) {
  // Filter for only COMP SCI courses and extract the course code
  const compSciCourses = completedCourses
    .filter(course => course.course.includes('COMP SCI'))
    .map(course => {
      // Extract just the course code part from the course string
      const match = course.course.match(/COMP SCI(\d+)/);
      return match ? `COMP SCI ${match[1]}` : '';
    })
    .filter(course => course); // Remove any empty entries after mapping

  // Remove duplicates by converting the array to a Set and back to an array
  const uniqueCompSciCourses = [...new Set(compSciCourses)];

  console.log('Completed CS Courses:', uniqueCompSciCourses);
  return uniqueCompSciCourses;
}

// Assuming completedCourses is the array obtained from scrapeCompletedCourses()
const completedCompSciCourses = filterAndFormatCompSciCourses(completedCourses);
console.log('Final list of unique completed COMP SCI courses:', completedCompSciCourses.join(', '));

// Example usage:
// Assuming you have obtained unique lists of taken and required 'COMP SCI' courses
const username = "Aiden04";
const takenCourses = filterAndFormatCompSciCourses(completedCourses); // Replace with your actual taken courses
const requiredCourses = filterAndFormatCompSciCourses(requiredCourses); // Replace with your actual required courses
postCompletedCourses(username, takenCourses, requiredCourses);



tryScrape();
