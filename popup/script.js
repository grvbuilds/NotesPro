// Function to show a specific tab and hide others
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Function to load saved text for a specific tab
function loadSavedText(tabName) {
    chrome.storage.sync.get([tabName], function (result) {
        const savedText = result[tabName];
        const textarea = document.getElementById(`${tabName}-notes`);
        if (savedText) {
            textarea.value = savedText;
        } else {
            textarea.value = ''; // Set to an empty string if no saved text
        }
    });
}

// Function to save text for a specific tab
function saveText(tabName) {
    const textarea = document.getElementById(`${tabName}-notes`);
    const text = textarea.value;
    const data = {};
    data[tabName] = text;

    chrome.storage.sync.set(data);
}

// Function to save the edited tab name
function saveTabName(tabName, newName) {
    chrome.storage.sync.get(['tabNames'], function (result) {
        const tabNames = result.tabNames || {}; // Get existing tab names or create an empty object
        tabNames[tabName] = newName;
        chrome.storage.sync.set({ tabNames }, function () {
            console.log('Tab name saved:', tabName, newName);
        }); // Save the updated tab names
    });
}

// Function to save the edited tab heading
function saveTabHeading(tabName, newHeading) {
    chrome.storage.sync.get(['tabHeadings'], function (result) {
        const tabHeadings = result.tabHeadings || {}; // Get existing tab headings or create an empty object
        tabHeadings[tabName] = newHeading;
        chrome.storage.sync.set({ tabHeadings }, function () {
            console.log('Tab heading saved:', tabName, newHeading);
        }); // Save the updated tab headings
    });
}

// Add event listeners to tab buttons
document.addEventListener('DOMContentLoaded', function () {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const headings = document.querySelectorAll('.tab-content.active h2'); // Select the h2 element within the active tab

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
            loadSavedText(tabName); // Load saved text when switching tabs

            // Allow the user to change the tab name by clicking on it
            if (button.classList.contains('active')) {
                button.contentEditable = true; // Enable editing
                button.focus(); // Focus on the button for editing
            } else {
                button.contentEditable = false; // Disable editing
                saveTabName(tabName, button.textContent); // Save the edited tab name
            }
        });
    });

    // Add event listeners for editing tab headings within the active tab
    headings.forEach(heading => {
        heading.addEventListener('click', function () {
            const tabName = heading.parentElement.getAttribute('id');
            const newHeading = prompt('Enter a new heading:'); // Prompt the user for a new heading
            if (newHeading !== null && newHeading.trim() !== '') {
                heading.textContent = newHeading; // Update the heading text
                saveTabHeading(tabName, newHeading); // Save the edited heading
            }
        });
    });

    // Show the 'To-Do' tab by default
    showTab('todo');
    loadSavedText('todo'); // Load saved text for the default tab

    // Add event listeners to text areas for saving text
    const textareas = document.querySelectorAll('.note-textarea');

    textareas.forEach(textarea => {
        textarea.addEventListener('input', function () {
            const tabName = textarea.getAttribute('id').replace('-notes', '');
            saveText(tabName); // Save text when it changes
        });
    });
});
