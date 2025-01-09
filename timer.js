const timersContainer = document.getElementById('timers');
const timers = [];

for (let i = 0; i < 9; i++) {
    const timerId = `timer${i}`;
    const billingId = `billing${i}`;
    const cardId = `card${i}`;

    timersContainer.innerHTML += `
        <div class="col-md-4 mb-4">
            <div class="card timer-inactive" id="${cardId}">
                <div class="card-body">
                    <h5 class="card-title">Meja ${i + 1}</h5>
                    <h6 class="card-subtitle mb-2 text-muted timer-text" id="${timerId}">00:00:00</h6>
                    <h6 class="card-subtitle mt-2">Billing: Rp. <span id="${billingId}">0.00</span></h6>
                    <button class="btn btn-primary m-1" onclick="startTimer(${i})">Start</button>
                    <button class="btn btn-danger m-1" onclick="stopTimer(${i})">Stop</button>
                    <button class="btn btn-secondary m-1" onclick="resetTimer(${i})">Reset</button>
                </div>
            </div>
        </div>
    `;

    timers.push({ seconds: 0, isRunning: false, interval: null, startTime: null });
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function saveTimerData(timerId, timeElapsed, price, date) {
    const id = generateUniqueId();
    const data = { id, timerId, timeElapsed, price, date };
    console.log('Saving timer data:', data);

    fetch('/save-timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                console.error('Server error:', response.statusText);
                return;
            }
            return response.text();
        })
        .then(result => {
            if (result) {
                console.log('Server response:', result);
            }
        })
        .catch(error => console.error('Fetch error:', error));
}

function printTimerData(timerId, timeElapsed, date, price) {
    let imageUrl = "https://i.imgur.com/OAKJlQi.png";
    imageUrl += `?timestamp=${new Date().getTime()}`;
    const fallbackImageUrl = "https://via.placeholder.com/96";
    const nomorMeja = String(timerId).replace(/\D/g, '');
    const timeElapsedInMinutes = Math.floor(timeElapsed / 60);
    const formattedDate = new Date(date).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);

    const printContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Receipt</title>
            <style>
               
            </style>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </head>
        <body>
            <center><img src="${imageUrl}" alt="" width="96" height="96" onerror="this.onerror=null;this.src='${imageUrl}';"></center>
            <div class="currentDate">${formattedDate}</div>
            <hr>
            <div class="receipt">
              <div><span class="label">Nomor Meja:</span> <span>${nomorMeja}</span></div>
              <div><span class="label">Waktu:</span> <span>${timeElapsedInMinutes} Menit</span></div>
              <div><span class="label">Harga:</span> <span>Rp. ${formattedPrice}</span></div>
            </div>
            <hr>
            <center>
              <h3>Terimakasih!!!</h3>
              <h3>Silahkan Datang Kembali</h3>
            </center>
        </body>
        </html>
    `;

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
}

function formatTime(sec) {
    let hrs = Math.floor(sec / 3600);
    let mins = Math.floor((sec % 3600) / 60);
    let secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentPricePerHour() {
    const currentHour = new Date().getHours();
    console.log(currentHour);
    if (currentHour >= 10 && currentHour < 17) {
        return 15000;
    } else {
        return 20000;
    }
}

function updateTimer(index) {
    document.getElementById(`timer${index}`).textContent = formatTime(timers[index].seconds);
    const pricePerHour = getCurrentPricePerHour();
    const billingAmount = (timers[index].seconds / 3600) * pricePerHour;
    document.getElementById(`billing${index}`).textContent = billingAmount.toFixed(2);
}

function startTimer(index) {
    if (!timers[index].isRunning) {
        timers[index].isRunning = true;
        timers[index].startTime = new Date(); 
        document.getElementById(`card${index}`).classList.remove('timer-inactive');
        document.getElementById(`card${index}`).classList.add('timer-active');
        timers[index].interval = setInterval(() => {
            timers[index].seconds++;
            updateTimer(index);
        }, 1000);
    }
}

function roundToNearestThousand(amount) {
    const remainder = amount % 1000;
    if (remainder >= 500) {
        return Math.ceil(amount / 1000) * 1000;
    } else {
        return Math.floor(amount / 1000) * 1000;
    }
}

function getPriceBetween(startTime, endTime) {
    const rateBefore = 15000; 
    const rateAfter = 20000;  
    let totalPrice = 0;
    let currentTime = new Date(startTime);
    let endDateTime = new Date(endTime);

    // If endTime is earlier in the day than startTime, add one day to endTime
    if (endDateTime <= currentTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
    }

    while (currentTime < endDateTime) {
        let nextPeriodEnd;
        let currentRate;

        // Determine the current rate and the end of the current period
        if (currentTime.getHours() >= 17 || currentTime.getHours() < 2) {
            currentRate = rateAfter;
            nextPeriodEnd = new Date(currentTime);
            nextPeriodEnd.setHours(2, 0, 0, 0);
            if (nextPeriodEnd <= currentTime) {
                nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 1);
            }
        } else {
            currentRate = rateBefore;
            nextPeriodEnd = new Date(currentTime);
            nextPeriodEnd.setHours(17, 0, 0, 0);
            if (nextPeriodEnd <= currentTime) {
                nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 1);
            }
        }

        // Ensure nextPeriodEnd does not exceed endDateTime
        if (nextPeriodEnd > endDateTime) {
            nextPeriodEnd = endDateTime;
        }

        // Calculate the duration in hours and add to total price
        let durationInHours = (nextPeriodEnd - currentTime) / 3600000;
        totalPrice += durationInHours * currentRate;

        // Move to the next period
        currentTime = nextPeriodEnd;
    }

    return totalPrice;
}

function stopTimer(index) {
    if (timers[index].isRunning) {
        timers[index].isRunning = false;
        document.getElementById(`card${index}`).classList.remove('timer-active');
        document.getElementById(`card${index}`).classList.add('timer-inactive');
        clearInterval(timers[index].interval);

        const timerId = index + 1;
        const timeElapsed = timers[index].seconds;
        const startTime = timers[index].startTime;
        const endTime = new Date();
        const date = endTime.toISOString();

        let price = getPriceBetween(startTime, endTime);

        price = roundToNearestThousand(price); 

        saveTimerData(timerId, timeElapsed, price, date);
        printTimerData(timerId, timeElapsed, date, price); 
    }
}

function resetTimer(index) {
    if (!timers[index].isRunning) {
        timers[index].seconds = 0;
        updateTimer(index);
        document.getElementById(`card${index}`).classList.remove('timer-active');
        document.getElementById(`card${index}`).classList.add('timer-inactive');
    }
}

function updateCurrentTime() {
    const currentTimeElement = document.querySelector('.time');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    currentTimeElement.textContent = formattedTime;
}

updateCurrentTime();
setInterval(updateCurrentTime, 1000);