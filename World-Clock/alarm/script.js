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
        alarmCard.dataset.id = alarm.id;
        
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const dayElements = dayNames.map((day, index) => {
            const isSelected = alarm.days.includes(index);
            return `<div class="day ${isSelected ? 'selected' : ''}" data-day="${index}">${day}</div>`;
        }).join(''); 
        
        alarmCard.innerHTML = `
    <div class="alarm-header">
        <div class="alarm-time">${formatTimeString(alarm.hour, alarm.minute, alarm.isAM)}</div>
        <button class="delete-btn" data-id="${alarm.id}">&times;</button>
    </div>
    <div class="alarm-countdown">${db.getCountdownText(alarm)}</div>
    <div class="day-selector">
        ${dayElements}
    </div>
    <div class="switch-container">
        <label class="switch">
            <input type="checkbox" ${alarm.isActive ? 'checked' : ''} onchange="toggleAlarm(${alarm.id})">
            <span class="slider"></span>
        </label>
    </div>
`;

        alarmCard.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); 
            const id = parseInt(e.target.dataset.id);
            if (confirm('Hapus alarm ini?')) {
                db.delete(id);
                renderAlarms();
            }
        });

        alarmCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('slider') && !e.target.classList.contains('switch') && e.target.type !== 'checkbox') {
                openEditModal(alarm.id);
            }
        });
        
        alarmContainer.appendChild(alarmCard);
    });
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
    
    const alarmData = {
        hour,
        minute,
        isAM,
        days: selectedDays
    };
    
    if (editingAlarmId) {
        db.update(editingAlarmId, alarmData);
    } else {
        db.add(alarmData);
    }
    
    renderAlarms();
    closeModal();
}

function toggleAlarm(id) {
    db.toggleActive(id);
    renderAlarms();
}

addButton.addEventListener('click', openAddModal);
cancelBtn.addEventListener('click', closeModal);
saveBtn.addEventListener('click', saveAlarm);

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
    if (isNaN(value) || value < 1) {
        this.value = 1;
    } else if (value > 12) {
        this.value = 12;
    }
});

minuteInput.addEventListener('input', function() {
    let value = parseInt(this.value);
    if (isNaN(value) || value < 0) {
        this.value = 0;
    } else if (value > 59) {
        this.value = 59;
    }
    
    if (this.value.length === 1) {
        this.value = this.value.padStart(2, '0');
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });

function updateCountdowns() {
    renderAlarms();
}

setInterval(updateCountdowns, 60000);

renderAlarms();
