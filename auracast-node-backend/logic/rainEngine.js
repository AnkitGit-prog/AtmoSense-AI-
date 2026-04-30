/**
 * logic/rainEngine.js
 * Ensemble logic: combines multiple API responses into a final rain prediction.
 */

// ─── Step 1: Align hours across APIs (use index-based alignment) ─────────────
function alignHours(apiArrays) {
    const minLength = Math.min(...apiArrays.map(a => a.length));
    const aligned = [];

    for (let i = 0; i < minLength; i++) {
        aligned.push(apiArrays.map(api => api[i]));
    }
    return aligned; // [ [hour0_api0, hour0_api1, hour0_api2], ... ]
}

// ─── Step 2: Ensemble + Smart Adjustment for a single hour slot ─────────────
function processHour(slotData) {
    const label = slotData[0].hour; // use first API's hour label

    const probs    = slotData.map(d => d.rain_probability);
    const humids   = slotData.map(d => d.humidity);
    const clouds   = slotData.map(d => d.cloud_cover);

    const avgProb  = probs.reduce((s, v) => s + v, 0) / probs.length;
    const avgHumid = humids.reduce((s, v) => s + v, 0) / humids.length;
    const avgCloud = clouds.reduce((s, v) => s + v, 0) / clouds.length;

    // Smart adjustment
    let adjusted = avgProb;
    if (avgHumid > 80 && avgCloud > 70) adjusted += 10;
    adjusted = Math.min(100, Math.max(0, adjusted));

    // Confidence: spread between APIs
    const maxSpread = probs.length > 1 ? (Math.max(...probs) - Math.min(...probs)) : 0;
    const confidence = maxSpread < 10 ? 'HIGH' : maxSpread < 25 ? 'MEDIUM' : 'LOW';

    return {
        hour:             label,
        rain_probability: Math.round(adjusted),
        humidity:         Math.round(avgHumid),
        cloud_cover:      Math.round(avgCloud),
        confidence,
        sources_used:     slotData.length,
        individual_probs: probs
    };
}

// ─── Step 3: Detect continuous rain time window ───────────────────────────────
function detectTimeWindow(hourlyResults, threshold = 50) {
    const rainy = hourlyResults.filter(h => h.rain_probability >= threshold);
    if (rainy.length === 0) return null;

    const fmt = (iso) => {
        const d = new Date(iso);
        const h = d.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12  = h % 12 || 12;
        return `${h12} ${ampm}`;
    };

    return `${fmt(rainy[0].hour)} – ${fmt(rainy[rainy.length - 1].hour)}`;
}

// ─── Step 4: Overall confidence & advice ─────────────────────────────────────
function overallConfidence(hourlyResults) {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    hourlyResults.forEach(h => counts[h.confidence]++);
    if (counts.HIGH >= hourlyResults.length * 0.6) return 'HIGH';
    if (counts.LOW  >= hourlyResults.length * 0.5) return 'LOW';
    return 'MEDIUM';
}

function buildAdvice(probability, timeWindow, confidence) {
    const advice = [];
    if (probability >= 70) {
        advice.push('🌧️ High rain chance — carry an umbrella.');
        if (timeWindow) advice.push(`⏰ Rain likely around ${timeWindow}.`);
    } else if (probability >= 40) {
        advice.push('🌦️ Moderate rain possible — keep an umbrella handy.');
    } else {
        advice.push('☀️ Low rain chance — enjoy your day!');
    }
    if (confidence === 'LOW') {
        advice.push('⚠️ Predictions vary across sources — check closer to the time.');
    }
    return advice;
}

// ─── Main Engine Function ─────────────────────────────────────────────────────
function runEnsemble(apiArrays) {
    const aligned       = alignHours(apiArrays);
    const hourlyResults = aligned.map(slot => processHour(slot));

    // Pick the peak (max probability hour)
    const peak = hourlyResults.reduce((best, h) => h.rain_probability > best.rain_probability ? h : best, hourlyResults[0]);

    const timeWindow   = detectTimeWindow(hourlyResults);
    const confidence   = overallConfidence(hourlyResults);
    const advice       = buildAdvice(peak.rain_probability, timeWindow, confidence);
    const shouldGoOut  = peak.rain_probability < 40;

    // Next 3 hours
    const next3Hours = hourlyResults.slice(0, 3).map(h => ({
        hour:             h.hour,
        rain_probability: h.rain_probability,
        confidence:       h.confidence
    }));

    return {
        rain_probability: peak.rain_probability,
        time_window:      timeWindow || 'No significant rain expected',
        confidence,
        advice,
        should_go_out:    shouldGoOut,
        next_3_hours:     next3Hours,
        hourly_forecast:  hourlyResults
    };
}

module.exports = { runEnsemble };
