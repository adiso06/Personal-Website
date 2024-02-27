
// Original timer logic from provided file
var timers = {
    1: { running: false, startTime: null, elapsed: 0, interval: null, count: 0 },
    2: { running: false, startTime: null, elapsed: 0, interval: null, count: 0 },
    3: { running: false, startTime: null, elapsed: 0, interval: null }
  };

  var actionLog = [];

  function formatTime(elapsed) {
    var minutes = Math.floor(elapsed / 60);
    var seconds = Math.floor(elapsed) % 60;
    var tenths = Math.floor(elapsed * 10) % 10;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '.' + tenths;
  }

  function updateTimerDisplay(timerId) {
    var timerElement = document.getElementById('timer' + timerId);
    timerElement.children[0].textContent = formatTime(timers[timerId].elapsed);
  }


  function updateCountDisplay(timerId) {
    var labelElement = document.getElementById('label' + timerId);
    var actionName = timerId === 1 ? 'Epi' : 'CPR';
    var labelText = actionName + ': ' + timers[timerId].count;
    labelElement.textContent = labelText;

    // Create a log entry
    const logEntry = {
        time: new Date().toLocaleTimeString(),
        timer: formatTime(timers[3].elapsed), // assuming timer 3 is your total timer
        action: `${actionName} count updated to ${timers[timerId].count}`
    };

    // Add the log entry to the actionLog array
    actionLog.push(logEntry);

    // Update the log display
    updateLogDisplay();
}


  function startTimer(timerId) {
    if (timers[timerId].running) return;
    timers[timerId].running = true;
    timers[timerId].startTime = Date.now() - timers[timerId].elapsed * 1000;
    timers[timerId].interval = setInterval(function() {
      timers[timerId].elapsed = (Date.now() - timers[timerId].startTime) / 1000;
      updateTimerDisplay(timerId);
    }, 100);
  }

  function stopTimer(timerId) {
    if (!timers[timerId].running) return;
    timers[timerId].running = false;
    clearInterval(timers[timerId].interval);
    timers[timerId].elapsed = (Date.now() - timers[timerId].startTime) / 1000;
    updateTimerDisplay(timerId);
    // Removed the count increment logic from here
}


  function resetTimer(timerId) {
    timers[timerId].elapsed = 0;
    updateTimerDisplay(timerId);
  }

  function startStopResetTimerold(timerId) {
    if (!timers[timerId].running && timers[timerId].elapsed === 0) {
      // First click - start the timer
      startTimer(timerId);
    } else if (timers[timerId].running) {
      // Second click - stop the timer
      stopTimer(timerId);
    } else {
      // Third click - reset and start the timer
      resetTimer(timerId);
      startTimer(timerId);
    }
    // Ensure bottom timer is running when the top timers are interacted with
    if (!timers[3].running) {
      startTimer(3);
    }
    addLogEntry(timerId);
  }

  function startStopResetTimer(timerId) {
    if (!timers[timerId].running && timers[timerId].elapsed === 0) {
        // First click - start the timer
        startTimer(timerId);
    } else if (timers[timerId].running) {
        // Timer is running - stop, reset, increment count, and start the timer
        stopTimer(timerId);
        resetTimer(timerId);
        timers[timerId].count++;
        updateCountDisplay(timerId); // Update the count display, function needs to be implemented
        startTimer(timerId);
    } else {
        // Timer is stopped but not reset - just start the timer
        startTimer(timerId);
    }

    // Ensure bottom timer is running when the top timers are interacted with
    if (!timers[3].running) {
        startTimer(3);
    }
}

  function toggleTimer(timerId) {
    if (!timers[timerId].running) {
      startTimer(timerId);
    } else {
      stopTimer(timerId);
      resetTimer(timerId); // Reset the bottom timer when stopped
    }
  }
// Dropdown functionality
document.querySelector('.dropbtn').onclick = function() {
    document.getElementById("myDropdown").classList.toggle("show");
}
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
function iterateCount(drug) {
    var button = document.querySelector(`button[onclick="iterateCount('${drug}')"]`);
    var count = parseInt(button.textContent.match(/\d+/)[0]) + 1;
    button.textContent = `${drug} (${count})`;
    const logEntry = {
        time: new Date().toLocaleTimeString(),
        timer: formatTime(timers[3].elapsed), // assuming timer 3 is your total timer
        action: `Administered ${drug}`
    };
    actionLog.push(logEntry);

    // update the log display
    updateLogDisplay();
}

// Shock button functionality
var shockCount = 0;
document.getElementById('shockButton').onclick = function() {
    shockCount += 1;
    this.textContent = `⚡ (${shockCount})`;
     // Log the action
     var now = new Date();
    actionLog.push({
        time: now.toLocaleTimeString(),
        timer: formatTime(timers[3].elapsed),
        action: 'Shock administered'
    });

    updateLogDisplay();
};

// Timer color change logic
function checkTimerColors() {
    // Assuming timers have a method to get elapsed time in seconds
    var cprTime = timers[2].elapsed; // Get elapsed time for CPR timer
    var epiTime = timers[1].elapsed; // Get elapsed time for Epi timer

    // Logic to turn CPR timer red after 2 minutes
    if (cprTime >= 120) { // 2 minutes for CPR
        document.getElementById("timer2").classList.add("timer-red");
    } else {
        document.getElementById("timer2").classList.remove("timer-red");
    }

    // Existing logic for Epi timer
    if (epiTime >= 180) { // 5 minutes for Epi
        document.getElementById("timer1").classList.add("timer-red");
    } else {
        document.getElementById("timer1").classList.remove("timer-red");
    }
}


// Regularly check for timer updates
// This should be integrated with your existing timer update mechanism
setInterval(function() {
    // Assuming you have a function to update timer display
    updateTimerDisplay(1);
    updateTimerDisplay(2);
    updateTimerDisplay(3);
    checkTimerColors();
}, 1000);

var holdTimeout;

function startHold(timerId) {
  holdTimeout = setTimeout(function() {
    decreaseCount(timerId); // Function called when button is held
  }, 1000); // 1000 milliseconds for hold detection
}

function stopHold(timerId) {
  clearTimeout(holdTimeout);
}

function decreaseCount(timerId) {
  if (timerId === 1 || timerId === 2) {
    timers[timerId].count = Math.max(0, timers[timerId].count - 1);
    updateCountDisplay(timerId); // Update the count display
  }
}

function addLogEntry(action) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const totalTimer = timers[3].elapsed; // Assuming timer 3 is the total timer
    const formattedTimer = formatTime(totalTimer);

    const table = document.getElementById('actionLog').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `<td>${timeString}</td><td>${formattedTimer}</td><td>${action}</td>`;
}

function updateLogDisplay() {
    const logTable = document.getElementById('actionLog');
    if (!logTable) {
        console.error('Log table not found.');
        return;
    }

    // Assuming the log is stored in an array named 'actionLog'
    // Clear the current log display
    logTable.innerHTML = '';

    // Create a header row if needed
    const headerRow = logTable.insertRow(0);
    headerRow.innerHTML = '<th>Time</th><th>Timer</th><th>Action</th>';

    // Iterate through the actionLog array and add each entry to the table
    actionLog.forEach((logEntry) => {
        const row = logTable.insertRow();
        row.innerHTML = `<td>${logEntry.time}</td><td>${logEntry.timer}</td><td>${logEntry.action}</td>`;
    });
}
