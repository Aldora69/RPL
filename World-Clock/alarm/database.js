const alarmSound = new Audio('alarm-sound.mp3');
alarmSound.loop = true;

class AlarmDatabase {
    constructor() {
        this.STORAGE_KEY = 'alarm_app_data';
        this.alarms = this.loadData();
        this.activeAlarmId = null;
        this.alarmCheckInterval = null;

        this.startAlarmChecker();
    }

    getAll() {
        return [...this.alarms];
    }

    getById(id) {
        return this.alarms.find(alarm => alarm.id === id) || null;
    }

    add(alarm) {
        const newId = this.alarms.length > 0 
            ? Math.max(...this.alarms.map(a => a.id)) + 1 
            : 1;
        
        const newAlarm = {
            ...alarm,
            id: newId,
            isActive: true
        };
        
        this.alarms.push(newAlarm);
        this.saveData();
        return newAlarm;
    }

    update(id, updatedData) {
        const alarmIndex = this.alarms.findIndex(alarm => alarm.id === id);
        
        if (alarmIndex === -1) {
            return null;
        }
        
        this.alarms[alarmIndex] = {
            ...this.alarms[alarmIndex],
            ...updatedData
        };
        
        this.saveData();
        return this.alarms[alarmIndex];
    }

    delete(id) {
        const alarmIndex = this.alarms.findIndex(alarm => alarm.id === id);
        
        if (alarmIndex === -1) {
            return false;
        }
        
        this.alarms.splice(alarmIndex, 1);
        this.saveData();
        return true;
    }

    toggleActive(id) {
        const alarm = this.getById(id);
        
        if (!alarm) {
            return null;
        }
        
        alarm.isActive = !alarm.isActive;
        this.saveData();
        return alarm;
    }

    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.alarms));
    }

    loadData() {
        const storedData = localStorage.getItem(this.STORAGE_KEY);
        
        if (!storedData) {
            return [
                {
                    id: 1,
                    hour: 8,
                    minute: 30,
                    isAM: true,
                    days: [3, 4, 5], // 0: Senin, 1: Selasa, 2: Rabu, 3: Kamis, 4: Jumat, 5: Sabtu, 6: Minggu
                    isActive: true
                },
                {
                    id: 2,
                    hour: 8,
                    minute: 30,
                    isAM: true,
                    days: [3, 4, 5],
                    isActive: false
                }
            ];
        }
        
        try {
            return JSON.parse(storedData);
        } catch (error) {
            console.error('Error parsing alarm data:', error);
            return [];
        }
    }

    getCountdownFor(alarm) {
        if (!alarm.isActive) {
            return "Alarm tidak aktif";
        }

        const now = new Date();
        const today = now.getDay(); 
        const adjustedToday = (today + 6) % 7; 

        let alarmHour = alarm.hour;
        if (!alarm.isAM && alarmHour < 12) {
            alarmHour += 12;
        } else if (alarm.isAM && alarmHour === 12) {
            alarmHour = 0;
        }

        const sortedDays = [...alarm.days].sort((a, b) => a - b);
        
        let nextDay = null;
        let daysUntilNext = Infinity;

        for (const day of sortedDays) {
            let diff = day - adjustedToday;
            
            if (diff === 0) {
                const alarmTime = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    alarmHour,
                    alarm.minute
                );
                
                if (alarmTime > now) {
                    nextDay = day;
                    daysUntilNext = 0;
                    break;
                }
                
                diff = 7;
            } else if (diff < 0) {
                diff += 7;
            }
            
            // Simpan hari terdekat
            if (diff < daysUntilNext) {
                daysUntilNext = diff;
                nextDay = day;
            }
        }
        
        if (nextDay === null) {
            return "Tidak ada jadwal";
        }
        
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + daysUntilNext);
        nextDate.setHours(alarmHour, alarm.minute, 0, 0);
        
        const diffMs = nextDate - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let countdownText = "in ";
        if (diffDays > 0) {
            countdownText += `${diffDays} day${diffDays !== 1 ? 's' : ''}, `;
        }
        if (diffHours > 0 || diffDays > 0) {
            countdownText += `${diffHours} hour${diffHours !== 1 ? 's' : ''}, `;
        }
        countdownText += `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        
        return {
            text: countdownText,
            nextDate: nextDate,
            diffMs: diffMs
        };
    }
    
    getCountdownText(alarm) {
        const countdown = this.getCountdownFor(alarm);
        return typeof countdown === 'string' ? countdown : countdown.text;
    }
    
    checkAlarms() {
        if (this.activeAlarmId !== null) {
            return;
        }
        
        const now = new Date();
        const activeAlarms = this.alarms.filter(alarm => alarm.isActive);
        
        for (const alarm of activeAlarms) {
            const countdown = this.getCountdownFor(alarm);
            
            if (typeof countdown === 'string') {
                continue;
            }
            
            if (countdown.diffMs < 1000) {
                this.triggerAlarm(alarm.id);
                break;
            }
        }
    }
    
    triggerAlarm(id) {
        this.activeAlarmId = id;
        alarmSound.play();
        
        this.showAlarmPopup(id);
    }
    
    showAlarmPopup(id) {
        const alarm = this.getById(id);
        if (!alarm) return;
        
        let popup = document.getElementById('alarmPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'alarmPopup';
            popup.className = 'alarm-popup';
            document.body.appendChild(popup);
        }
        
        popup.innerHTML = `
            <div class="alarm-popup-content">
                <h2>Alarm!</h2>
                <p class="alarm-time-popup">${formatTimeString(alarm.hour, alarm.minute, alarm.isAM)}</p>
                <button id="stopAlarmBtn" class="modal-btn btn-save">Matikan Alarm</button>
            </div>
        `;
        
        popup.style.display = 'flex';

        document.getElementById('stopAlarmBtn').addEventListener('click', () => {
            this.stopAlarm();
            popup.style.display = 'none';
        });
    }

    stopAlarm() {
        if (this.activeAlarmId !== null) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            this.activeAlarmId = null;
        }
    }
    
    startAlarmChecker() {
        this.alarmCheckInterval = setInterval(() => {
            this.checkAlarms();
        }, 1000);
    }
    
    stopAlarmChecker() {
        if (this.alarmCheckInterval) {
            clearInterval(this.alarmCheckInterval);
            this.alarmCheckInterval = null;
        }
    }
}

const db = new AlarmDatabase();