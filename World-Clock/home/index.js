import { timeZonesList } from '../locale.js';

const searchInput = document.getElementById('searchInput');
const dropdownList = document.getElementById('dropdownList');
const mainTime = document.getElementById('main-time');
const currentTimezone = document.getElementById('current-timezone');
const timezoneDisplay = document.querySelector('.timezone-display');
const timezoneDropdown = document.querySelector('.timezone-dropdown');
const timezone1 = document.getElementById('timezone-1');
const timezone2 = document.getElementById('timezone-2');

let currentZone = 'Asia/Bangkok';
const secondaryZones = {
  'timezone-1': 'America/Puerto_Rico',
  'timezone-2': 'America/Chicago'
};

// Initialize timezone names
timezone1.querySelector('.timezone-name').textContent = getSimpleName(secondaryZones['timezone-1']);
timezone2.querySelector('.timezone-name').textContent = getSimpleName(secondaryZones['timezone-2']);

// Helper function to get simple name from timezone
function getSimpleName(timezone) {
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace('_', ' ');
}

// Populate dropdown with timezones
function populateDropdown(filter = '') {
  dropdownList.innerHTML = '';
  const filtered = timeZonesList.filter(zone =>
    zone.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No match found';
    li.setAttribute('disabled', true);
    dropdownList.appendChild(li);
    return;
  }

  filtered.forEach(zone => {
    const li = document.createElement('li');
    li.textContent = zone;
    li.addEventListener('click', () => {
      currentZone = zone;
      currentTimezone.textContent = zone;
      timezoneDropdown.style.display = 'none';
      updateAllTimes();
    });
    dropdownList.appendChild(li);
  });
}

// Format time for main display (with AM/PM)
function formatMainTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  const formattedHours = hours.toString().padStart(2, '0');
  
  return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

// Format time for secondary timezones (hour:minute only)
function formatSecondaryTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Calculate time difference in hours
function calculateTimeDifference(timezone1, timezone2) {
  const now = new Date();
  
  // Get date objects in both timezones
  const date1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }));
  const date2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }));
  
  // Calculate difference in hours
  const diffMs = date1 - date2;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours.toFixed(1);
}

// Update all times
function updateAllTimes() {
  const now = new Date();
  
  // Update main time
  const mainTimeDate = new Date(now.toLocaleString('en-US', { timeZone: currentZone }));
  mainTime.textContent = formatMainTime(mainTimeDate);
  
  // Update secondary timezones
  for (const [id, timezone] of Object.entries(secondaryZones)) {
    const element = document.getElementById(id);
    const timeElement = element.querySelector('.timezone-time');
    const dateElement = element.querySelector('.timezone-date');
    
    const timezoneDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    timeElement.textContent = formatSecondaryTime(timezoneDate);
    
    // Calculate time difference
    const diff = calculateTimeDifference(currentZone, timezone);
    const prefix = diff > 0 ? '-' : '+';
    dateElement.textContent = `Today, ${prefix}${Math.abs(diff)}H`;
  }
}

// Function to add close button to timezone cards
function addCloseButtons() {
  const timezoneCards = document.querySelectorAll('.timezone-card');
  
  timezoneCards.forEach(card => {
    // Check if close button already exists
    if (!card.querySelector('.close-btn')) {
      // Create close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Remove timezone');
      
      // Add click event to remove the card
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Add fade out animation
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        
        // Remove the card after animation
        setTimeout(() => {
          card.remove();
        }, 300);
      });
      
      // Insert close button at the beginning of the card
      card.insertBefore(closeBtn, card.firstChild);
    }
  });
}

// Initialize close buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addCloseButtons();
});

// Also add close buttons if cards are dynamically added later
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && node.classList.contains('timezone-card')) {
          addCloseButtons();
        }
      });
    }
  });
});

// Start observing for dynamically added timezone cards
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Event listeners
searchInput.addEventListener('input', e => {
  populateDropdown(e.target.value);
});

timezoneDisplay.addEventListener('click', () => {
  if (timezoneDropdown.style.display === 'none' || !timezoneDropdown.style.display) {
    timezoneDropdown.style.display = 'block';
    searchInput.focus();
    populateDropdown();
  } else {
    timezoneDropdown.style.display = 'none';
  }
});

document.addEventListener('click', e => {
  if (!timezoneDisplay.contains(e.target) && !timezoneDropdown.contains(e.target)) {
    timezoneDropdown.style.display = 'none';
  }
});

// Initialize
populateDropdown();
updateAllTimes();
setInterval(updateAllTimes, 1000);
