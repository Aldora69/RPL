const alarmContainer = document.getElementById('alarmContainer');
const addButton = document.getElementById('addButton');
const editButton = document.getElementById('editButton');
const modal = document.getElementById('alarmModal');
const modalTitle = document.getElementById('modalTitle');
const hourInput = document.getElementById('hourInput');
const minuteInput = document.getElementById('minuteInput');
const amBtn = document.getElementById('amBtn');
const pmBtn = document.getElementById('pmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const daySelectorModal = document.getElementById('daySelectorModal');
const themeToggle = document.getElementById('theme-toggle');

let editingAlarmId = null;
let isEditMode = false;

window.formatTimeString = function(hour, minute, isAM) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`;
}

function renderAlarms() {
    const alarms = db.getAll();
    alarmContainer.innerHTML = '';

    alarms.forEach(alarm => {
        const alarmCard = document.createElement('div');
        alarmCard.className = 'alarm-card';
        if (isEditMode) {
            alarmCard.classList.add('editable');
        }
        alarmCard.dataset.id = alarm.id;

        const dayNames = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
        const dayElements = dayNames.map((day, index) => {
            const isSelected = alarm.days.includes(index);
            return `<div class="day ${isSelected ? 'selected' : ''}" data-day="${index}">${day}</div>`;
        }).join('');

        alarmCard.innerHTML = `
            <div class="alarm-header">
                <div class="alarm-time">${formatTimeString(alarm.hour, alarm.minute, alarm.isAM)}</div>
                </div>
            <div class="alarm-countdown">${db.getCountdownText(alarm)}</div>
            <div class="day-selector">
                ${dayElements}
            </div>
            <div class="switch-container">
                <label class="switch">
                    <input type="checkbox" ${alarm.isActive ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            ${isEditMode ? `<button class="delete-btn" data-id="${alarm.id}">❌</button>` : ''}
        `;

        const switchInput = alarmCard.querySelector('.switch input[type="checkbox"]');
        if (switchInput) {
            switchInput.addEventListener('change', () => {
                toggleAlarm(alarm.id);
            });
        }

        const deleteButton = alarmCard.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.target.dataset.id);
                if (confirm('Anda yakin ingin menghapus alarm ini?')) {
                    db.delete(id);
                    renderAlarms();
                }
            });
        }
        
        alarmCard.addEventListener('click', (e) => {
            if (isEditMode) {
                if (!e.target.closest('.delete-btn') && !e.target.closest('.switch')) {
                    openEditModal(alarm.id);
                }
            }
        });

        alarmContainer.appendChild(alarmCard);
    });
}

function toggleAlarm(id) {
    db.toggleActive(id);

    const alarmCardElement = document.querySelector(`.alarm-card[data-id="${id}"]`);
    if (!alarmCardElement) return;

    const countdownElement = alarmCardElement.querySelector('.alarm-countdown');
    if (!countdownElement) return;

    const updatedAlarm = db.getById(id);
    
    const newText = db.getCountdownText(updatedAlarm);
    
    countdownElement.textContent = newText;
}

function openAddModal() {
    modalTitle.textContent = 'Tambah Alarm';
    editingAlarmId = null;
    hourInput.value = 8;
    minuteInput.value = 30;
    amBtn.classList.add('selected');
    pmBtn.classList.remove('selected');
    daySelectorModal.querySelectorAll('.day').forEach(day => {
        const dayIndex = parseInt(day.dataset.day);
        if ([3, 4, 5].includes(dayIndex)) {
            day.classList.add('selected');
        } else {
            day.classList.remove('selected');
        }
    });
    modal.style.display = 'flex';
}

function openEditModal(id) {
    const alarm = db.getById(id);
    if (!alarm) return;
    modalTitle.textContent = 'Edit Alarm';
    editingAlarmId = id;
    hourInput.value = alarm.hour;
    minuteInput.value = alarm.minute;
    if (alarm.isAM) {
        amBtn.classList.add('selected');
        pmBtn.classList.remove('selected');
    } else {
        pmBtn.classList.add('selected');
        amBtn.classList.remove('selected');
    }
    daySelectorModal.querySelectorAll('.day').forEach(day => {
        const dayIndex = parseInt(day.dataset.day);
        if (alarm.days.includes(dayIndex)) {
            day.classList.add('selected');
        } else {
            day.classList.remove('selected');
        }
    });
    modal.style.display = 'flex';
}

function closeModal() {
    if (isEditMode) {
        isEditMode = false;
        editButton.classList.remove('active');
        renderAlarms();
    }
    modal.style.display = 'none';
}

function saveAlarm() {
    const hour = parseInt(hourInput.value) || 12;
    const minute = parseInt(minuteInput.value) || 0;
    const isAM = amBtn.classList.contains('selected');
    const selectedDays = [];
    daySelectorModal.querySelectorAll('.day.selected').forEach(day => {
        selectedDays.push(parseInt(day.dataset.day));
    });
    const alarmData = { hour, minute, isAM, days: selectedDays };
    if (editingAlarmId) {
        db.update(editingAlarmId, alarmData);
    } else {
        db.add(alarmData);
    }
    
    if (isEditMode) {
        isEditMode = false;
        editButton.classList.remove('active');
    }

    renderAlarms();
    closeModal();
}

addButton.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveAlarm);

editButton.addEventListener('click', () => {
    isEditMode = !isEditMode;
    editButton.classList.toggle('active');
    renderAlarms();
});

amBtn.addEventListener('click', () => {
    amBtn.classList.add('selected');
    pmBtn.classList.remove('selected');
});

pmBtn.addEventListener('click', () => {
    pmBtn.classList.add('selected');
    amBtn.classList.remove('selected');
});

daySelectorModal.querySelectorAll('.day').forEach(day => {
    day.addEventListener('click', () => {
        day.classList.toggle('selected');
    });
});

hourInput.addEventListener('input', function() {
    let value = parseInt(this.value);
    if (isNaN(value) || value < 1) this.value = 1;
    else if (value > 12) this.value = 12;
});

minuteInput.addEventListener('input', function() {
    let value = parseInt(this.value);
    if (isNaN(value) || value < 0) this.value = 0;
    else if (value > 59) this.value = 59;
    if (this.value.length === 1) this.value = this.value.padStart(2, '0');
});


function updateCountdowns() {

    if (!isEditMode) {
        renderAlarms();
    }
}
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

setInterval(updateCountdowns, 60000);

renderAlarms();