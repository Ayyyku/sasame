const timersContainer = document.getElementById('timers');
const timers = [];
const prices = [];
let imageUrl = "https://lh3.googleusercontent.com/fife/ALs6j_F0tCDxUt5s7088jfehbtphJk9tHwqtpN84k1Y80KF2wa68EVYPuuRYA7VFRZHavwxNVvqNs3DX_3FWtFku9uNdWyDqCZBwigJVyGrwqHuYFFRf3Tkb-sVHL73By7ueOBPbKMpDY6d0FfmveUDiPx9yGIsQBhVkXAtWthQff6Efw_sYrkZAF_tlguFCkQ4AZ_ZnSUS1sCvOmbfRcEbyPEbw2Tl1gLav65P8qBGz5jDLS7m7PVYDVs5V3xBa944pJ4bJ0iPJRAU2i7rXXBPoibhCwZRQmwg1vCVacNwYkpargBjmJm-gS1D8XjafceIV7F-FOBtGHjBTsB2eZl-TAP8RKIMZ23L-Eud_75Mm-JasigjlLW593620YwUUwUcuhKtaKhXJO_bVKKU7zcnbtRlaXXBb5lb9eGvxbWo5ux_QqsQDIZJrLlGGwJaP9zhiDwEEhOm99M_m1-XZH_j3w8qvsqToDyosLMvHFnShOGgHf8CjbUQVL2Mwr7yaVPxb4AEAQg2HrFWZE2Yiq8kdoa_S6zQaGpwtohivsdpBBWjVZqNvYMuNIy57svzGL-MDKk6uJXzuGNfqDOyon1KkDnS1H6JMfvG3stMzy4zjOGFo9-UGMa8TSa9Hw38Nn5OWv1ptmPYbUpcn9cftpPtCQY4fVzwvp6kSoMZudGYigYqVEil8lt4QwdFWPB2U7AXLAZvSNWzJsMVhQyft6_GLRnL3OzMbRvp1eassckypA8ztojjXKchRgrPLsz4FfEwau8l85OYuCLJJpgHS8CaoIM4nLMnhNz_qclvmBnhiiXM_8bJSHqLPlxlyX7r81G2eEXZYPAkT2AYNRrFL0_DC-55lJS00FRbSJkn1d0qUxkTdP9dbM0vIOWwsY1HFoGkOlarZ-DZteMaRfIiVLbrw7QihQEwUxtFUGWN2sDirXuvENuVpPiGdkRwUzznhLbznSJOrRhwXTR1iV5AEc3nI4G9yndChg-HQUuugC-ESYLaCt5PHEo9kEePOHZzajZ4SuULr6tB8CobwCixqqXZz6CFeQDi3Xi-Kw_QE8aEbpHjVWxXMsEIZiM02QhuWYsZDI9qvlGGeMyuLdc-0skramGoR7udOw6CBzficffEuMUSTdVlSwzQXYVuafDhrW1aAHXMBTdEko4EAKOQ2sfI43oDVjrUd73oTLZdko5T5bt8NheJJtFbQ0znEXK5LeL2nASfUrKIjKmLzs3fRskqfQoN_t2FUYsWq_Zy5fIcwE9PuGATP3WcUmNBOFiuUFIzDN2UE7S3EcNxZOMa1WftaMVal82-taYVe_jGPD6iDY7RAwc-LziyRhbup6VReypWwLGClczQNI3rdbaMg6ptjJjVT3gV53qv6IfVBb22hpJay_8xZMXBsIUH1rhwyvNfDkZGFJO4H8PhBTvAxFxgjUPb6nBskW3HsWTUKRHIy4_7GugEPg4W_FzpavsAb7l2eK1vtmjDnV_17YQCwpGI7vmFnAXJqasud6fD5nxeoI7q7JC9Ka9rts1vvxaHn7EMhDiHpiO3HKbkkMIStpPGR8ZoiOubBQz-F_PxGJCMXXheEcCcosuw3prHIC81KeuOKUsvt7Se9aN9e1Wg138F4HPfIzcDvQC7-ZNttqnpPcgSndB2vaSsI=w1920-h912";

for (let i = 0; i < 9; i++) {
    const timerId = `timer${i}`;
    const priceId = `price${i}`;
    const billingId = `billing${i}`;
    const cardId = `card${i}`;
    const defaultPrice = i < 4 ? 20000 : 25000;

    timersContainer.innerHTML += `
        <div class="col-md-4 mb-4">
            <div class="card timer-inactive" id="${cardId}">
                <div class="card-body">
                    <h5 class="card-title">Meja ${i + 1}</h5>
                    <h6 class="card-subtitle mb-2 text-muted timer-text" id="${timerId}">00:00:00</h6>
                    <input type="number" id="${priceId}" class="form-control mb-2" placeholder="Price per hour" value="${defaultPrice}">
                    <h6 class="card-subtitle mt-2">Billing: Rp. <span id="${billingId}">0.00</span></h6>
                    <button class="btn btn-primary m-1" onclick="startTimer(${i})">Start</button>
                    <button class="btn btn-danger m-1" onclick="stopTimer(${i})">Stop</button>
                    <button class="btn btn-secondary m-1" onclick="resetTimer(${i})">Reset</button>
                </div>
            </div>
        </div>
    `;

    timers.push({seconds: 0, isRunning: false, interval: null});
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
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.error('Error:', error));
}

function printTimerData(timerId, timeElapsed, date, price) {
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
    const formattedPrice = new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(price);

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
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function formatTime(sec) {
    let hrs = Math.floor(sec / 3600);
    let mins = Math.floor((sec % 3600) / 60);
    let secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimer(index) {
    document.getElementById(`timer${index}`).textContent = formatTime(timers[index].seconds);
    const pricePerHour = parseFloat(document.getElementById(`price${index}`).value);
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
        const pricePerHour = parseFloat(document.getElementById(`price${index}`).value);
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