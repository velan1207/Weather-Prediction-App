const axios = require('axios');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

async function fetchWeatherData(city) {
    const apiKey = 'f4906f865b631341d0f3fbf49114de36';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    try {
        const response = await axios.get(apiUrl);
        const weatherData = response.data;
        const weatherInfo = {
            city: weatherData.name,
            temperature: (weatherData.main.temp - 273.15).toFixed(2) + '°C',
            description: weatherData.weather[0].description
        };
        return weatherInfo;
    } catch (error) {
        console.error('An error occurred:', error.message);
        return null;
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Serve index.html
    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } 
    // Serve CSS file
    else if (req.method === 'GET' && parsedUrl.pathname === '/style.css') {
        const filePath = path.join(__dirname, 'style.css');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    } 
    // Weather information
    else if (req.method === 'GET' && parsedUrl.pathname === '/weather') {
        const location = parsedUrl.query.location;
        if (location) {
            fetchWeatherData(location)
                .then(weatherData => {
                    if (weatherData) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(weatherData));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Location not found' }));
                    }
                })
                .catch(error => {
                    console.error('An error occurred:', error.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                });
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Location parameter missing' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
