/**
 * routes/rain.js
 * GET /rain-prediction?lat=&lon=
 */

const express            = require('express');
const router             = express.Router();
const { fetchAllRainData } = require('../services/rainService');
const { runEnsemble }    = require('../logic/rainEngine');

// Simple in-memory cache (5 minutes per lat/lon)
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(lat, lon) {
    return `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
}

/**
 * GET /rain-prediction
 * @query lat   {number} Latitude
 * @query lon   {number} Longitude
 */
router.get('/', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ detail: 'lat and lon query params are required.' });
    }

    const key     = getCacheKey(lat, lon);
    const cached  = cache.get(key);

    // Return cached result if still fresh
    if (cached && (Date.now() - cached.ts < CACHE_TTL_MS)) {
        console.log(`[RainRoute] Cache hit for ${key}`);
        return res.json({ ...cached.data, cached: true });
    }

    try {
        const apiArrays = await fetchAllRainData(lat, lon);
        const result    = runEnsemble(apiArrays);

        const response = {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            sources_queried: apiArrays.length,
            ...result,
            generated_at: new Date().toISOString(),
            cached: false
        };

        // Store in cache
        cache.set(key, { data: response, ts: Date.now() });

        console.log(`[RainRoute] lat=${lat} lon=${lon} | Rain: ${result.rain_probability}% | Confidence: ${result.confidence}`);
        res.json(response);

    } catch (err) {
        res.status(503).json({ detail: err.message });
    }
});

module.exports = router;
