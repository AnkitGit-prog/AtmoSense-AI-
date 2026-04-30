const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const WAQI_API_KEY = process.env.WAQI_API_KEY || '';

async function fetchWeather(city) {
    if (!OPENWEATHER_API_KEY) {
        return {
            temperature: parseFloat((Math.random() * (35.0 - 15.0) + 15.0).toFixed(1)),
            humidity: parseFloat((Math.random() * (90.0 - 30.0) + 30.0).toFixed(1)),
            wind_speed: parseFloat((Math.random() * 20.0).toFixed(1)),
            uv_index: parseFloat((Math.random() * 11.0).toFixed(1))
        };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        wind_speed: response.data.wind.speed,
        uv_index: 5.0
    };
}

async function fetchAqi(city) {
    if (!WAQI_API_KEY) {
        const aqi_val = Math.floor(Math.random() * (180 - 20 + 1)) + 20;
        return {
            aqi: aqi_val,
            pm25: parseFloat((aqi_val * 0.4).toFixed(1)),
            pm10: parseFloat((aqi_val * 0.6).toFixed(1)),
            no2: parseFloat((Math.random() * (50.0 - 10.0) + 10.0).toFixed(1)),
            o3: parseFloat((Math.random() * (60.0 - 20.0) + 20.0).toFixed(1))
        };
    }

    // Step 1: Use WAQI search API — much better city name matching
    try {
        const searchUrl = `https://api.waqi.info/search/?token=${WAQI_API_KEY}&keyword=${encodeURIComponent(city)}`;
        const searchRes = await axios.get(searchUrl);

        if (searchRes.data.status === 'ok' && searchRes.data.data.length > 0) {
            const station = searchRes.data.data[0];
            const uid = station.uid;

            // Step 2: Fetch full data from station UID
            const feedUrl = `https://api.waqi.info/feed/@${uid}/?token=${WAQI_API_KEY}`;
            const feedRes = await axios.get(feedUrl);

            if (feedRes.data.status === 'ok') {
                const d = feedRes.data.data;
                const iaqi = d.iaqi || {};
                return {
                    aqi: d.aqi,
                    pm25: parseFloat((iaqi.pm25?.v ?? 0).toFixed(1)),
                    pm10: parseFloat((iaqi.pm10?.v ?? 0).toFixed(1)),
                    no2:  parseFloat((iaqi.no2?.v  ?? 0).toFixed(1)),
                    o3:   parseFloat((iaqi.o3?.v   ?? 0).toFixed(1))
                };
            }
        }
    } catch (e) {
        console.log('Search API failed, trying direct feed...', e.message);
    }

    // Step 3: Fallback — direct city name feed
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${WAQI_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    if (data.status === 'ok') {
        const iaqi = data.data.iaqi || {};
        return {
            aqi: data.data.aqi,
            pm25: parseFloat((iaqi.pm25?.v ?? 0).toFixed(1)),
            pm10: parseFloat((iaqi.pm10?.v ?? 0).toFixed(1)),
            no2:  parseFloat((iaqi.no2?.v  ?? 0).toFixed(1)),
            o3:   parseFloat((iaqi.o3?.v   ?? 0).toFixed(1))
        };
    } else {
        throw new Error(`AQI data not found for "${city}". Try a nearby major city.`);
    }
}

module.exports = {
    fetchWeather,
    fetchAqi
};
