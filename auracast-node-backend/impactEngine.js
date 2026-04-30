function calculateImpact(weather, aqiData, userProfile) {
    const temp = weather.temperature;
    const humidity = weather.humidity;
    const aqi = aqiData.aqi;

    // Step 1: Convert inputs into scores
    let aqi_score = 1;
    if (aqi > 200) aqi_score = 4;
    else if (aqi > 100) aqi_score = 3;
    else if (aqi > 50) aqi_score = 2;

    let temp_score = 1;
    if (temp >= 40) temp_score = 4;
    else if (temp >= 30) temp_score = 3;
    else if (temp >= 15) temp_score = 2;

    let humidity_modifier = 0;
    let dehydration_risk = "LOW";
    let fatigue_level = "LOW";

    if (humidity < 30) {
        humidity_modifier = 1;
        dehydration_risk = "HIGH";
    } else if (humidity > 70) {
        humidity_modifier = 1;
        fatigue_level = "HIGH";
        dehydration_risk = "MEDIUM";
    }

    if (temp >= 30 && humidity <= 70) dehydration_risk = "HIGH";
    if (temp >= 30 && humidity > 70) fatigue_level = "HIGH";

    // Step 2: Combine scores
    let total_score = aqi_score + temp_score + humidity_modifier;

    // Step 3: Personalization
    if (userProfile.activity_type && userProfile.activity_type.toLowerCase() === 'gym') {
        total_score += 1;
    }
    if (userProfile.health_conditions && userProfile.health_conditions.toLowerCase() === 'asthma') {
        total_score += 2;
    }
    if (userProfile.sensitivity && userProfile.sensitivity.toLowerCase() === 'high') {
        total_score += 2;
    }

    // Step 4: Generate outputs
    let stamina = "100%";
    if (total_score >= 8) stamina = "40%";
    else if (total_score >= 6) stamina = "65%";
    else if (total_score >= 4) stamina = "80%";

    let breathing_stress = "LOW";
    if (aqi_score >= 3 || (userProfile.health_conditions === 'asthma' && aqi_score >= 2)) {
        breathing_stress = "HIGH";
    } else if (aqi_score === 2) {
        breathing_stress = "MEDIUM";
    }

    const impactResult = {
        stamina,
        breathing_stress,
        dehydration_risk,
        fatigue_level,
        risk_score: total_score
    };

    const recommendations = generateRecommendations(impactResult, temp, aqi, humidity);

    return {
        impact: impactResult,
        recommendations
    };
}

function generateRecommendations(impactResult, temp, aqi, humidity) {
    const recs = [];
    if (aqi > 100) {
        recs.push("High AQI: Avoid prolonged outdoor activities.");
    }
    if (temp >= 30) {
        recs.push("High Temperature: Increase your water intake significantly.");
    }
    if (humidity > 70) {
        recs.push("High Humidity: Reduce physical exertion as sweat evaporation is lower.");
    }
    if (impactResult.breathing_stress === "HIGH") {
        recs.push("Breathing Stress is high: Keep an inhaler handy if you have asthma and consider staying indoors.");
    }
    if (impactResult.risk_score >= 8) {
        recs.push("Overall risk score is very high. Best to stay indoors in a controlled environment.");
    }

    if (recs.length === 0) {
        recs.push("Conditions are great! Enjoy your planned activities.");
    }

    return recs.slice(0, 5); // Return 3-5 recommendations max
}

module.exports = {
    calculateImpact
};
