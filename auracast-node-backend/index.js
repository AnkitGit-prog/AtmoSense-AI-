require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, PredictionLog } = require('./db');
const { fetchWeather, fetchAqi } = require('./services');
const { runPredictions } = require('./predictions');
const { calculateImpact } = require('./impactEngine');
const exposureRouter    = require('./routes/exposure');
const rainRouter        = require('./routes/rain');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();

// ── Feature Routes ──────────────────────────────────────────
app.use('/exposure',        exposureRouter);   // Personal Exposure Tracker
app.use('/rain-prediction', rainRouter);       // Ensemble Rain Prediction

app.get('/', (req, res) => {
    res.json({ message: "Welcome to AtmoSense AI Node.js API" });
});

app.get('/weather', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) return res.status(400).json({ detail: "City is required" });
        const data = await fetchWeather(city);
        res.json(data);
    } catch (e) {
        res.status(400).json({ detail: e.message });
    }
});

app.get('/air-quality', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) return res.status(400).json({ detail: "City is required" });
        const data = await fetchAqi(city);
        res.json(data);
    } catch (e) {
        res.status(400).json({ detail: e.message });
    }
});

app.post('/predict', async (req, res) => {
    try {
        const userInput = req.body;
        if (!userInput.city || !userInput.activity_type || !userInput.health_sensitivity) {
             return res.status(400).json({ detail: "Missing required fields" });
        }
        
        const weather = await fetchWeather(userInput.city);
        const aqi = await fetchAqi(userInput.city);
        
        const prediction = runPredictions(weather, aqi, userInput);
        
        const logEntry = new PredictionLog({
            city: userInput.city,
            weather: weather,
            aqi: aqi,
            prediction: prediction,
            user_input: userInput
        });
        
        try {
            await logEntry.save();
        } catch (dbEx) {
            console.log(`Failed to log to MongoDB: ${dbEx.message}`);
        }
        
        res.json(logEntry);
    } catch (e) {
        res.status(400).json({ detail: e.message });
    }
});

app.post('/get-impact', async (req, res) => {
    try {
        const userInput = req.body;
        // Expecting { city, age, gender, activity_type, health_conditions, sensitivity }
        if (!userInput.city) {
             return res.status(400).json({ detail: "City is required" });
        }
        
        const weather = await fetchWeather(userInput.city);
        const aqi = await fetchAqi(userInput.city);
        
        const result = calculateImpact(weather, aqi, userInput);
        
        res.json({
            weather: { temperature: weather.temperature, humidity: weather.humidity },
            aqi: aqi,
            user_profile: userInput,
            ...result
        });
    } catch (e) {
        res.status(400).json({ detail: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
