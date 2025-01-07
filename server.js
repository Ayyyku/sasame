import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "json")));



// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'data.html'));
});

app.get('/get-timer-data', (req, res) => {
    const filePath = path.join(__dirname, 'timeData.json');
    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading data');
        }
        try {
            const jsonData = fileData ? JSON.parse(fileData) : [];
            res.json(jsonData);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

app.post('/save-timer', (req, res) => {
    const timerData = req.body;
    const filePath = path.join(__dirname, 'timeData.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        let jsonData = [];
        if (err) {
            if (err.code === 'ENOENT') {
                // File doesn't exist, create a new array
                console.log('timeData.json not found. Creating a new file.');
            } else {
                console.error('Error reading file:', err);
                return res.status(500).send('Error reading data');
            }
        } else {
            try {
                jsonData = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                return res.status(500).send('Error parsing data');
            }
        }

        jsonData.push(timerData);

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing data');
            }

            res.send('Timer data saved successfully');
        });
    });
});

app.delete('/delete-timer/:id', (req, res) => {
    const id = req.params.id;

    fs.readFile('timeData.json', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Internal Server Error');
        }

        let jsonData = JSON.parse(data);
        jsonData = jsonData.filter(item => item.id !== id);

        fs.writeFile('timeData.json', JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Internal Server Error');
            }

            res.send('Timer data deleted successfully');
        });
    });
});

app.get('/get-daily-income', (req, res) => {
    const filePath = path.join(__dirname, 'dailyIncome.json');
    const requestedDate = req.query.date; // Get date from query parameter
    const { startDate, endDate } = req.query;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading daily income data:', err);
            return res.status(500).send('Internal Server Error');
        }
        try {
            const jsonData = JSON.parse(data);
            if (startDate && endDate) {
                const filteredData = {};
                const start = new Date(startDate);
                const end = new Date(endDate);
                for (const [date, income] of Object.entries(jsonData)) {
                    const currentDate = new Date(date);
                    if (currentDate >= start && currentDate <= end) {
                        filteredData[date] = income;
                    }
                }
                res.json(filteredData);
            } else if (requestedDate) {
                // If a date is specified, return data for that date
                const filteredData = {};
                if (jsonData[requestedDate]) {
                    filteredData[requestedDate] = jsonData[requestedDate];
                }
                res.json(filteredData);
            } else {
                // If no date is specified, return all data
                res.json(jsonData);
            }
        } catch (parseError) {
            console.error('Error parsing daily income data:', parseError);
            res.status(500).send('Error parsing data');
        }
    });
});

// Serve the print.html file
app.get('/print.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'print.html'));
});

app.post('/save-daily-income', (req, res) => {
    const filePath = path.join(__dirname, 'dailyIncome.json');
    const dailyIncomeData = req.body;
    fs.writeFile(filePath, JSON.stringify(dailyIncomeData, null, 2), (err) => {
        if (err) {
            console.error('Error saving daily income data:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.send('Daily income data saved successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});