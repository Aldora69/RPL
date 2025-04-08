import { timeZonesList } from './locale.js';

const searchInput = document.getElementById('searchInput');
const dropdownList = document.getElementById('dropdownList');
const showDate = document.querySelector('.show-date');
const themeToggleButton = document.getElementById('theme-toggle');

let currentZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function populateDropdown(filter = '') {
  dropdownList.innerHTML = '';
  const filtered = timeZonesList.filter(zone =>
    zone.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    dropdownList.innerHTML = `<li disabled>No match found</li>`;
    return;
  }

  filtered.forEach(zone => {
    const li = document.createElement('li');
    li.textContent = zone;
    li.addEventListener('click', () => {
      searchInput.value = zone;
      currentZone = zone;
      dropdownList.classList.add('hidden');
    });
    dropdownList.appendChild(li);
  });
}

function updateTime() {
  const now = new Date();
  const options = {
    timeZone: currentZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  showDate.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
}

searchInput.addEventListener('input', e => {
  populateDropdown(e.target.value);
  dropdownList.classList.remove('hidden');
});

searchInput.addEventListener('focus', () => {
  populateDropdown(searchInput.value);
  dropdownList.classList.remove('hidden');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.custom-select-wrapper')) {
    dropdownList.classList.add('hidden');
  }
});

themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

populateDropdown();
setInterval(updateTime, 1000);
updateTime();
