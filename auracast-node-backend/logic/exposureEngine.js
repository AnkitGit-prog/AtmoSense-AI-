/**
 * exposureEngine.js
 * Personal Exposure Tracker — Pollution + Heat
 *
 * Tracks cumulative daily exposure per user (in-memory).
 * Resets automatically at midnight.
 */

// ─── In-Memory Store ────────────────────────────────────────────────────────
// Key: userId (string), Value: { pollution_exposure, heat_exposure, date }
const exposureStore = new Map();

// ─── Reset at Midnight ───────────────────────────────────────────────────────
function scheduleNightlyReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // next midnight
    const msUntilMidnight = midnight - now;

    setTimeout(() => {
        exposureStore.clear();
        console.log('[ExposureEngine] Daily exposure data reset at midnight.');
        scheduleNightlyReset(); // reschedule for next night
    }, msUntilMidnight);
}
scheduleNightlyReset();

// ─── Limits & Personalization ─────────────────────────────────────────────────
const POLLUTION_MAX = 10000;
const HEAT_MAX      = 5000;

/**
 * Apply personalization multipliers before adding to cumulative total.
 */
function applyPersonalization(rawPollution, rawHeat, userType, healthCondition) {
    let pollutionMultiplier = 1.0;
    let heatMultiplier      = 1.0;

    // Activity modifier
    if (userType === 'gym' || userType === 'runner') {
        pollutionMultiplier += 0.20;
        heatMultiplier      += 0.20;
    }

    // Health condition modifier
    if (healthCondition === 'asthma') {
        pollutionMultiplier += 0.50; // +50% pollution sensitivity
    }
    if (healthCondition === 'heart issues') {
        heatMultiplier += 0.30;
    }

    return {
        adjustedPollution: rawPollution * pollutionMultiplier,
        adjustedHeat:      rawHeat      * heatMultiplier
    };
}

/**
 * getRiskLevel — maps percentage to SAFE / WARNING / DANGEROUS
 */
function getRiskLevel(pollutionPct, heatPct) {
    const worst = Math.max(pollutionPct, heatPct);
    if (worst >= 80) return 'DANGEROUS';
    if (worst >= 50) return 'WARNING';
    return 'SAFE';
}

/**
 * getAdvice — returns 3-5 actionable tips based on current exposure
 */
function getAdvice(pollutionPct, heatPct, riskLevel) {
    const advice = [];

    if (pollutionPct >= 80) {
        advice.push('🚫 Avoid all outdoor activities — pollution is dangerously high.');
        advice.push('😷 Wear an N95 mask if you must go outside.');
    } else if (pollutionPct >= 50) {
        advice.push('⚠️ Limit outdoor exposure — air quality is poor.');
        advice.push('😷 Consider wearing a mask outdoors.');
    }

    if (heatPct >= 80) {
        advice.push('🌡️ Extreme heat risk — stay indoors and in cool areas.');
        advice.push('💧 Drink at least 3-4 litres of water today.');
    } else if (heatPct >= 50) {
        advice.push('☀️ High heat — avoid sun between 11 AM and 4 PM.');
        advice.push('💧 Increase water intake throughout the day.');
    }

    if (advice.length === 0) {
        advice.push('✅ Conditions are safe for outdoor activities today.');
    }

    return advice.slice(0, 5);
}

/**
 * predictFutureExposure — predicts exposure 30 mins from now
 * based on current AQI & temperature (linear extrapolation)
 */
function predictFutureExposure(current, aqi, temperature, minutesAhead = 30) {
    const hrs = minutesAhead / 60;
    return {
        pollution_exposure: current.pollution_exposure + (aqi         * hrs),
        heat_exposure:      current.heat_exposure      + (temperature * hrs)
    };
}

// ─── Main Engine Function ─────────────────────────────────────────────────────
/**
 * updateAndGetExposure
 *
 * @param {string} userId        — unique user identifier (e.g. "user_123" or city+type combo)
 * @param {number} aqi           — current AQI value
 * @param {number} temperature   — current temperature in °C
 * @param {number} minutes       — minutes since last update (default 60)
 * @param {string} userType      — "office worker" | "runner" | "gym" | "student"
 * @param {string} healthCondition — "none" | "asthma" | "heart issues"
 * @returns {object}             — full exposure report
 */
function updateAndGetExposure(userId, aqi, temperature, minutes = 60, userType = 'office worker', healthCondition = 'none') {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get or init user record
    let record = exposureStore.get(userId);
    if (!record || record.date !== today) {
        record = { pollution_exposure: 0, heat_exposure: 0, date: today };
    }

    // Raw incremental exposure for this interval
    const hrs = minutes / 60;
    const rawPollution = aqi         * hrs;
    const rawHeat      = temperature * hrs;

    // Apply personalization
    const { adjustedPollution, adjustedHeat } = applyPersonalization(rawPollution, rawHeat, userType, healthCondition);

    // Accumulate
    record.pollution_exposure += adjustedPollution;
    record.heat_exposure      += adjustedHeat;
    exposureStore.set(userId, record);

    // Convert to percentage and clamp 0–100
    const pollution_percent = Math.min(100, Math.max(0, (record.pollution_exposure / POLLUTION_MAX) * 100));
    const heat_percent      = Math.min(100, Math.max(0, (record.heat_exposure      / HEAT_MAX)      * 100));

    const risk_level = getRiskLevel(pollution_percent, heat_percent);
    const advice     = getAdvice(pollution_percent, heat_percent, risk_level);

    // Future prediction (+30 min)
    const future = predictFutureExposure(record, aqi, temperature, 30);
    const future_pollution_percent = Math.min(100, (future.pollution_exposure / POLLUTION_MAX) * 100);
    const future_heat_percent      = Math.min(100, (future.heat_exposure      / HEAT_MAX)      * 100);

    console.log(`[ExposureEngine] User: ${userId} | AQI: ${aqi} | Temp: ${temperature}°C | Pollution: ${pollution_percent.toFixed(1)}% | Heat: ${heat_percent.toFixed(1)}% | Risk: ${risk_level}`);

    return {
        pollution_percent:      parseFloat(pollution_percent.toFixed(1)),
        heat_percent:           parseFloat(heat_percent.toFixed(1)),
        pollution_exposure_raw: parseFloat(record.pollution_exposure.toFixed(2)),
        heat_exposure_raw:      parseFloat(record.heat_exposure.toFixed(2)),
        risk_level,
        advice,
        prediction_30min: {
            pollution_percent: parseFloat(future_pollution_percent.toFixed(1)),
            heat_percent:      parseFloat(future_heat_percent.toFixed(1)),
            risk_level:        getRiskLevel(future_pollution_percent, future_heat_percent)
        },
        tracked_at: new Date().toISOString()
    };
}

module.exports = { updateAndGetExposure };
