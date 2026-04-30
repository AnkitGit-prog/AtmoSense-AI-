function calculateHeatIndex(tempC, humidity) {
    const tempF = tempC * 9/5 + 32;
    let hiF;
    if (tempF < 80) {
        hiF = 0.5 * (tempF + 61.0 + ((tempF - 68.0) * 1.2) + (humidity * 0.094));
    } else {
        hiF = -42.379 + 2.04901523*tempF + 10.14333127*humidity - 0.22475541*tempF*humidity - 0.00683783*Math.pow(tempF, 2) - 0.05481717*Math.pow(humidity, 2) + 0.00122874*Math.pow(tempF, 2)*humidity + 0.00085282*tempF*Math.pow(humidity, 2) - 0.00000199*Math.pow(tempF, 2)*Math.pow(humidity, 2);
    }
    const hiC = (hiF - 32) * 5/9;
    return parseFloat(Math.max(tempC, hiC).toFixed(1));
}

function estimateBodyTempIncrease(heatIndex, activity) {
    let baseIncrease = 0.0;
    if (['running', 'gym'].includes(activity)) baseIncrease += 0.8;
    else if (['walking', 'commuting'].includes(activity)) baseIncrease += 0.3;
    
    if (heatIndex > 32) {
        baseIncrease += (heatIndex - 32) * 0.05;
    }
    return parseFloat(baseIncrease.toFixed(2));
}

function calculateHydration(tempC, humidity, activity) {
    let baseMl = 200;
    if (activity === 'running') baseMl += 500;
    else if (activity === 'gym') baseMl += 400;
    else if (activity === 'walking') baseMl += 200;
    else if (activity === 'commuting') baseMl += 100;
    
    if (tempC > 25) {
        baseMl += Math.floor((tempC - 25) * 20);
    }
    return baseMl;
}

function calculateLungRecovery(aqi, pm25, sensitivity) {
    let baseRecovery = 1.0;
    if (aqi > 50) {
        baseRecovery += (aqi - 50) * 0.02;
    }
    if (sensitivity === 'asthma sensitive') {
        baseRecovery *= 1.5;
    }
    return parseFloat(baseRecovery.toFixed(1));
}

function getRecommendation(aqi, heatIndex, sensitivity) {
    if (aqi > 150 || heatIndex > 38) {
        return ["Dangerous conditions. Avoid outdoor activities.", "red"];
    } else if (aqi > 100 || heatIndex > 32 || (sensitivity === 'asthma sensitive' && aqi > 50) || (sensitivity === 'heat sensitive' && heatIndex > 28)) {
        return ["Moderate conditions. Reduce intensity and stay hydrated.", "yellow"];
    } else {
        return ["Great conditions for outdoor activities!", "green"];
    }
}

function runPredictions(weather, aqi, userInput) {
    const hi = calculateHeatIndex(weather.temperature, weather.humidity);
    const tempInc = estimateBodyTempIncrease(hi, userInput.activity_type);
    const hydration = calculateHydration(weather.temperature, weather.humidity, userInput.activity_type);
    const recovery = calculateLungRecovery(aqi.aqi, aqi.pm25, userInput.health_sensitivity);
    const [rec, color] = getRecommendation(aqi.aqi, hi, userInput.health_sensitivity);
    
    return {
        heat_index: hi,
        temp_increase: tempInc,
        hydration_req_ml_hr: hydration,
        lung_recovery_time_hrs: recovery,
        activity_recommendation: rec,
        safety_level: color
    };
}

module.exports = {
    runPredictions
};
