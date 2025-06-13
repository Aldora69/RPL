import { timeZonesList } from '/locale.js';

const searchInput = document.getElementById('searchInput');
const dropdownList = document.getElementById('dropdownList');
const mainTime = document.getElementById('main-time');
const currentTimezone = document.getElementById('current-timezone');
const timezoneDisplay = document.querySelector('.timezone-display');
const timezoneDropdown = document.querySelector('.timezone-dropdown');
const themeToggle = document.getElementById('theme-toggle');
const timezone1 = document.getElementById('timezone-1');
const timezone2 = document.getElementById('timezone-2');

let currentZone = 'Asia/Bangkok';
const secondaryZones = {
  'timezone-1': 'America/Puerto_Rico',
  'timezone-2': 'America/Chicago'
};

timezone1.querySelector('.timezone-name').textContent = getSimpleName(secondaryZones['timezone-1']);
timezone2.querySelector('.timezone-name').textContent = getSimpleName(secondaryZones['timezone-2']);

function getSimpleName(timezone) {
  const parts = timezone.split('/');
  return parts[parts.length - 1].replace('_', ' ');
}

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

function formatMainTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const formattedHours = hours.toString().padStart(2, '0');
  
  return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

function formatSecondaryTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function calculateTimeDifference(timezone1, timezone2) {
  const now = new Date();
  
  const date1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }));
  const date2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }));
  
  const diffMs = date1 - date2;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours.toFixed(1);
}

function updateAllTimes() {
  const now = new Date();
  
  const mainTimeDate = new Date(now.toLocaleString('en-US', { timeZone: currentZone }));
  mainTime.textContent = formatMainTime(mainTimeDate);
  
  for (const [id, timezone] of Object.entries(secondaryZones)) {
    const element = document.getElementById(id);
    const timeElement = element.querySelector('.timezone-time');
    const dateElement = element.querySelector('.timezone-date');
    
    const timezoneDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    timeElement.textContent = formatSecondaryTime(timezoneDate);
    
    const diff = calculateTimeDifference(currentZone, timezone);
    const prefix = diff > 0 ? '-' : '+';
    dateElement.textContent = `Today, ${prefix}${Math.abs(diff)}H`;
  }
}

function addCloseButtons() {
  const timezoneCards = document.querySelectorAll('.timezone-card');
  
  timezoneCards.forEach(card => {
    if (!card.querySelector('.close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Remove timezone');
      
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
          card.remove();
        }, 300);
      });
      
      card.insertBefore(closeBtn, card.firstChild);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  addCloseButtons();
});

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

observer.observe(document.body, {
  childList: true,
  subtree: true
});

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

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
      document.body.classList.add('dark');
  }
  
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) { 
      themeToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark');
          
          if (document.body.classList.contains('dark')) {
              localStorage.setItem('theme', 'dark');
          } else {
              localStorage.setItem('theme', 'light');
          }
      });
  }
  
  const secondIndicator = document.getElementById('second-indicator') || 
                          document.querySelector('.second-indicator') ||
                          document.querySelector('#second-indicator');
  if (secondIndicator) {
      secondIndicator.style.transform = `translate(-50%, -50%) rotate(0deg) translateY(-135px)`;
  }
});
populateDropdown();
updateAllTimes();
setInterval(updateAllTimes, 1000);