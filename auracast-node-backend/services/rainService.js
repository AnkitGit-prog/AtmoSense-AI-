/**
 * services/rainService.js
 * Fetches rain data from 3 APIs and normalizes to a common format.
 * Open-Meteo is FREE (no key). OWM key reused from env. Weatherbit optional.
 */

const axios = require('axios');

const OWM_KEY  = process.env.OPENWEATHER_API_KEY || '';
const WB_KEY   = process.env.WEATHERBIT_API_KEY  || '';

// ─── Normalize each API to: { hour, rain_probability, humidity, cloud_cover } ──

async function fetchOpenWeatherMap(lat, lon) {
    if (!OWM_KEY) return null;
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&cnt=8`;
        const { data } = await axios.get(url, { timeout: 6000 });
        return data.list.map(item => ({
            hour:             item.dt_txt,
            rain_probability: Math.round((item.pop || 0) * 100),
            humidity:         item.main.humidity,
            cloud_cover:      item.clouds.all,
            source:           'openweathermap'
        }));
    } catch (e) {
        console.warn('[RainService] OpenWeatherMap failed:', e.message);
        return null;
    }
}

async function fetchOpenMeteo(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,relativehumidity_2m,cloudcover&forecast_days=1&timezone=auto`;
        const { data } = await axios.get(url, { timeout: 6000 });

        const hours = data.hourly.time;
        return hours.slice(0, 8).map((hour, i) => ({
            hour,
            rain_probability: data.hourly.precipitation_probability[i] ?? 0,
            humidity:         data.hourly.relativehumidity_2m[i]        ?? 0,
            cloud_cover:      data.hourly.cloudcover[i]                  ?? 0,
            source:           'open-meteo'
        }));
    } catch (e) {
        console.warn('[RainService] Open-Meteo failed:', e.message);
        return null;
    }
}

async function fetchWeatherbit(lat, lon) {
    if (!WB_KEY) return null;
    try {
        const url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${lat}&lon=${lon}&key=${WB_KEY}&hours=8`;
        const { data } = await axios.get(url, { timeout: 6000 });
        return data.data.map(item => ({
            hour:             item.timestamp_local,
            rain_probability: Math.round(item.pop || 0),
            humidity:         item.rh,
            cloud_cover:      item.clouds,
            source:           'weatherbit'
        }));
    } catch (e) {
        console.warn('[RainService] Weatherbit failed:', e.message);
        return null;
    }
}

/**
 * fetchAllRainData
 * Returns array of normalized hourly arrays from all successful APIs.
 * Gracefully handles any API failure.
 */
async function fetchAllRainData(lat, lon) {
    const results = await Promise.allSettled([
        fetchOpenWeatherMap(lat, lon),
        fetchOpenMeteo(lat, lon),
        fetchWeatherbit(lat, lon),
    ]);

    const successful = results
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value);

    if (successful.length === 0) {
        throw new Error('All rain APIs failed. Please try again later.');
    }

    return successful;
}

module.exports = { fetchAllRainData };
