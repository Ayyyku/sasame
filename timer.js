const timersContainer = document.getElementById('timers');
const timers = [];
const prices = [];

for (let i = 0; i < 9; i++) {
    const timerId = `timer${i}`;
    const billingId = `billing${i}`;
    const cardId = `card${i}`;
    const defaultPrice = i < 4 ? 20000 : 25000;

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

    timers.push({ seconds: 0, isRunning: false, interval: null });
    prices.push(defaultPrice);
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function saveTimerData(timerId, timeElapsed, price, date) {
    const id = generateUniqueId(); // Generate a unique ID
    const data = { id, timerId, timeElapsed, price, date }; // Include the ID in the data
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
    let imageUrl = "logo.png";
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
        <html lang="en">
        <body>
            <center><img src="${imageUrl}" alt="" width="96" height="96"></center>
            <div class="currentDate">${formattedDate}</div>
            <hr>
            <div class="receipt">
              <div><span class="label">Nomor Meja:</span> <span>${nomorMeja}</span></div>
              <div><span class="label">Waktu:</span> <span>${timeElapsedInMinutes}</span></div>
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
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        printWindow.document.write(printContent);
        printWindow.print();
        printWindow.document.close();
    };
}

function formatTime(sec) {
    let hrs = Math.floor(sec / 3600);
    let mins = Math.floor((sec % 3600) / 60);
    let secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentPricePerHour() {
    const currentHour = new Date().getHours();
    if (currentHour >= 10 && currentHour < 17) {
        return 20000;
    } else {
        return 25000;
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

function stopTimer(index) {
    if (timers[index].isRunning) {
        timers[index].isRunning = false;
        document.getElementById(`card${index}`).classList.remove('timer-active');
        document.getElementById(`card${index}`).classList.add('timer-inactive');
        clearInterval(timers[index].interval);

        const timerId = index + 1;
        const timeElapsed = timers[index].seconds;
        const pricePerHour = getCurrentPricePerHour();
        let price = (timeElapsed / 3600) * pricePerHour;
        const date = new Date().toISOString();

        const currentHour = new Date().getHours();
        if (currentHour >= 23 || currentHour < 4) {
            price += 5000;
        }

        price = roundToNearestThousand(price); // Apply rounding before saving

        saveTimerData(timerId, timeElapsed, price, date);
        printTimerData(timerId, timeElapsed, date, price); // Call the print function
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