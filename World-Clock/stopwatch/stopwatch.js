let startTime = null;
  let elapsedTime = 0;
  let timer = null;
  let lapCount = 0;
  const display = document.getElementById("display");
  const secondIndicator = document.getElementById("secondIndicator");

  function updateDisplay() {
    const time = elapsedTime + (timer ? performance.now() - startTime : 0);
    const totalMs = Math.floor(time);
    const ms = Math.floor((totalMs % 1000) / 10);
    const s = Math.floor(totalMs / 1000) % 60;
    const m = Math.floor(totalMs / 60000) % 60;
    const h = Math.floor(totalMs / 3600000);

    display.innerHTML = 
      `${String(h).padStart(2, '0')}:` +
      `${String(m).padStart(2, '0')}:` +
      `${String(s).padStart(2, '0')}:` +
      `${String(ms).padStart(2, '0')}`;

    // Rotate second indicator
    const angle = (s + ms / 100) * 6; // 360deg / 60s
    secondIndicator.style.transform = `rotate(${angle}deg) translateY(-135px)`;

    if (timer) requestAnimationFrame(updateDisplay);
  }

  function startStop() {
    if (!timer) {
      startTime = performance.now();
      timer = true;
      requestAnimationFrame(updateDisplay);
      document.getElementById("startStopBtn").innerText = "Lap";
    } else {
      lapCount++;
      const lapTime = display.innerText;
      const lapEl = document.createElement("div");
      lapEl.className = "lap-item";
      lapEl.innerHTML = `${lapCount} Lap <span>${lapTime}</span>`;
      document.getElementById("laps").prepend(lapEl);
    }
  }

  function pauseTimer() {
    if (timer) {
      elapsedTime += performance.now() - startTime;
      timer = null;
      document.getElementById("startStopBtn").innerText = "Start";
    }
  }

  function resetTimer() {
    timer = null;
    startTime = null;
    elapsedTime = 0;
    lapCount = 0;
    display.innerHTML = "00:00:00:00";
    document.getElementById("laps").innerHTML = "";
    document.getElementById("startStopBtn").innerText = "Start";
    secondIndicator.style.transform = `rotate(0deg) translateY(-90px)`;
  }

  // Generate tick marks inside the circle
  const tickContainer = document.getElementById("tickMarks");
  for (let i = 0; i < 60; i++) {
    const tick = document.createElement("div");
    tick.style.transform = `rotate(${i * 6}deg)`;
    tickContainer.appendChild(tick);
  }