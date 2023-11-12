async function getUserReqs() {
    // In highlightCoursesScripts
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.message === "your_message_here") {
                // Do something with the message
            }
        }
    );
    const getUserClassesTakenEndpoint = 'http://coursemate.tech:5000/getHighlights'

    const response = await fetch(getUserClassesTakenEndpoint)
    const data = await response.json()
    console.log(data)
}

let username = ""

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received from popup:', message);
   
  })

function getClasses() {
    console.log('test')
    getUserReqs()
    const classes = document.getElementsByTagName("cse-course-list-item");

    Object.keys(classes).forEach((element, index) => {
        const classDiv = document.getElementsByTagName("cse-course-list-item")[index].getElementsByClassName('left grow catalog')[0]
        classDiv.style.backgroundColor = 'green'
    });

}

getClasses()