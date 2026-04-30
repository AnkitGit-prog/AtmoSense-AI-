/**
 * routes/exposure.js
 * GET /exposure
 *
 * Reuses existing fetchWeather() and fetchAqi() from services.js.
 * Does NOT duplicate any API calls.
 */

const express  = require('express');
const router   = express.Router();
const { fetchWeather, fetchAqi } = require('../services');
const { updateAndGetExposure }   = require('../logic/exposureEngine');

/**
 * GET /exposure
 *
 * Query Params:
 *   city            (string, required) — e.g. "Mumbai"
 *   userType        (string, optional) — "office worker" | "runner" | "gym" | "student"
 *   healthCondition (string, optional) — "none" | "asthma" | "heart issues"
 *   userId          (string, optional) — unique user ID for tracking (defaults to city+userType)
 *   minutes         (number, optional) — minutes of exposure interval (default 60)
 */
router.get('/', async (req, res) => {
    const {
        city,
        userType        = 'office worker',
        healthCondition = 'none',
        minutes         = 60
    } = req.query;

    if (!city) {
        return res.status(400).json({ detail: 'city query param is required.' });
    }

    // Stable user key — use explicit userId or derive from city+profile
    const userId = req.query.userId || `${city.toLowerCase()}_${userType}_${healthCondition}`;

    try {
        // ── Reuse existing service functions ─────────────────────────
        const [weatherData, aqiData] = await Promise.all([
            fetchWeather(city),
            fetchAqi(city)
        ]);

        const { temperature } = weatherData;
        const { aqi }         = aqiData;

        // ── Run Exposure Engine ───────────────────────────────────────
        const report = updateAndGetExposure(
            userId,
            aqi,
            temperature,
            Number(minutes),
            userType,
            healthCondition
        );

        res.json({
            city,
            user_profile: { userType, healthCondition, minutes: Number(minutes) },
            current_conditions: { temperature, aqi },
            ...report
        });

    } catch (err) {
        res.status(400).json({ detail: err.message });
    }
});

module.exports = router;
