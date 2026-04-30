# AtmoSense AI – Complete Project Workflow Diagrams

> A detailed visual breakdown of every feature, data flow, and architectural layer.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph USER["👤 User / Browser"]
        BROWSER["React Frontend<br/>localhost:5173"]
    end

    subgraph FRONTEND["🖥️ Frontend — React + Vite"]
        APP["App.jsx<br/>(Router + Layout)"]
        HOME["Home.jsx<br/>Weather Dashboard"]
        INPUTFORM["InputForm.jsx<br/>Prediction Input"]
        PREDICTION["PredictionDashboard.jsx<br/>AI Results"]
        AIRQUALITY["AirQuality.jsx<br/>Pollutant Charts"]
        API_SERVICE["api.js<br/>Axios HTTP Client"]
        CARD["Card.jsx<br/>Glass Card Component"]
        BADGE["StatusBadge.jsx<br/>Safety Indicator"]
    end

    subgraph BACKEND["⚙️ Backend — Node.js + Express"]
        EXPRESS["index.js<br/>Express Server :5000"]
        SERVICES["services.js<br/>Weather & AQI Fetcher"]
        PREDICT_ENGINE["predictions.js<br/>AI Prediction Engine"]
        DB_MODULE["db.js<br/>Mongoose + MongoDB"]
    end

    subgraph EXTERNAL["🌐 External APIs"]
        OPENWEATHER["OpenWeatherMap API"]
        WAQI["WAQI Air Quality API"]
    end

    subgraph DATABASE["🗄️ Database"]
        MONGODB["MongoDB Atlas<br/>PredictionLog Collection"]
    end

    BROWSER --> APP
    APP --> HOME & INPUTFORM & PREDICTION & AIRQUALITY
    HOME & INPUTFORM & AIRQUALITY --> API_SERVICE
    HOME --> CARD & BADGE
    API_SERVICE -->|HTTP GET/POST| EXPRESS
    EXPRESS --> SERVICES
    EXPRESS --> PREDICT_ENGINE
    EXPRESS --> DB_MODULE
    SERVICES -->|Live API Calls| OPENWEATHER & WAQI
    SERVICES -.->|Mock Fallback| EXPRESS
    DB_MODULE --> MONGODB
    PREDICT_ENGINE -->|Returns Predictions| EXPRESS
```

---

## 2. Complete User Journey Flow

```mermaid
flowchart TD
    START(["🌐 User Opens App"]) --> NAV{"Navigation Bar"}
    
    NAV -->|"Dashboard"| DASH["📊 Home / Dashboard Page"]
    NAV -->|"Predict"| PRED_INPUT["🤖 AI Prediction Form"]
    NAV -->|"Air Quality"| AQI_PAGE["💨 Air Quality Page"]

    %% Dashboard Flow
    DASH --> SEARCH_CITY["🔍 Search City<br/>(Default: Indore)"]
    SEARCH_CITY --> LOAD_WEATHER["⏳ Loading Spinner"]
    LOAD_WEATHER --> PARALLEL_FETCH["Parallel API Calls"]
    PARALLEL_FETCH --> WEATHER_CARD["🌡️ Temperature Card<br/>+ Safety Badge"]
    PARALLEL_FETCH --> AQI_CARD["💨 AQI Card<br/>+ PM2.5 Value"]
    PARALLEL_FETCH --> HUMIDITY_CARD["💧 Humidity Card"]
    PARALLEL_FETCH --> WIND_CARD["🌬️ Wind Speed Card"]
    PARALLEL_FETCH --> UV_CARD["☀️ UV Index Card"]

    %% Prediction Flow
    PRED_INPUT --> ENTER_CITY["📍 Enter City Location"]
    ENTER_CITY --> SELECT_ACTIVITY["🏃 Select Activity Type<br/>(Walking / Running / Gym / Commuting)"]
    SELECT_ACTIVITY --> SELECT_HEALTH["❤️ Select Health Sensitivity<br/>(Normal / Asthma / Heat Sensitive)"]
    SELECT_HEALTH --> SUBMIT["✨ Generate AI Insights"]
    SUBMIT --> LOADING["⏳ Analyzing Environment..."]
    LOADING --> RESULTS["📈 Prediction Dashboard"]

    RESULTS --> REC_CARD["🟢🟡🔴 AI Recommendation Card"]
    RESULTS --> HEAT_CARD["🔥 Heat Index + Temp Increase"]
    RESULTS --> HYDRATE_CARD["💧 Hydration Check (ml/hr)"]
    RESULTS --> LUNG_CARD["🫁 Lung Recovery Time + Progress Bar"]

    %% Air Quality Flow
    AQI_PAGE --> AQI_SEARCH["🔍 Search City<br/>(Default: Los Angeles)"]
    AQI_SEARCH --> AQI_LOAD["⏳ Loading"]
    AQI_LOAD --> BAR_CHART["📊 Recharts Bar Chart<br/>(PM2.5, PM10, NO2, O3)"]
    AQI_LOAD --> POLLUTANT_GRID["📋 Pollutant Summary Grid<br/>(4 Cards with Values)"]

    style START fill:#10b981,color:#000
    style RESULTS fill:#0ea5e9,color:#000
    style WEATHER_CARD fill:#f59e0b,color:#000
    style AQI_CARD fill:#14b8a6,color:#000
```

---

## 3. Backend API Pipeline

```mermaid
sequenceDiagram
    participant FE as 🖥️ React Frontend
    participant EX as ⚙️ Express Server
    participant SV as 📡 Services Layer
    participant PR as 🧠 Prediction Engine
    participant DB as 🗄️ MongoDB
    participant OW as 🌤️ OpenWeatherMap
    participant WQ as 💨 WAQI API

    Note over FE,WQ: === GET /weather?city=London ===
    FE->>EX: GET /weather?city=London
    EX->>SV: fetchWeather("London")
    alt Has API Key
        SV->>OW: GET api.openweathermap.org/data/2.5/weather
        OW-->>SV: { temp, humidity, wind, ... }
        SV-->>EX: { temperature, humidity, wind_speed, uv_index }
    else No API Key (Mock Fallback)
        SV-->>EX: { random temperature 15-35°C, humidity 30-90%, ... }
    end
    EX-->>FE: JSON Weather Response

    Note over FE,WQ: === GET /air-quality?city=London ===
    FE->>EX: GET /air-quality?city=London
    EX->>SV: fetchAqi("London")
    alt Has API Key
        SV->>WQ: GET api.waqi.info/feed/London
        WQ-->>SV: { aqi, iaqi: { pm25, pm10, no2, o3 } }
        SV-->>EX: { aqi, pm25, pm10, no2, o3 }
    else No API Key (Mock Fallback)
        SV-->>EX: { aqi: random 20-180, pm25, pm10, no2, o3 }
    end
    EX-->>FE: JSON AQI Response

    Note over FE,WQ: === POST /predict ===
    FE->>EX: POST /predict { city, activity_type, health_sensitivity }
    EX->>SV: fetchWeather(city) + fetchAqi(city)
    SV-->>EX: weather + aqi data
    EX->>PR: runPredictions(weather, aqi, userInput)
    PR-->>EX: { heat_index, temp_increase, hydration, lung_recovery, recommendation, safety_level }
    EX->>DB: Save PredictionLog document
    DB-->>EX: ✅ Saved (or graceful failure)
    EX-->>FE: Full prediction response with all metrics
```

---

## 4. AI Prediction Engine — Internal Logic

```mermaid
flowchart TD
    INPUT["📥 Inputs<br/>weather, aqi, userInput"] --> HI["🌡️ calculateHeatIndex<br/>(temperature, humidity)"]
    INPUT --> HY["💧 calculateHydration<br/>(temperature, humidity, activity)"]
    INPUT --> LR["🫁 calculateLungRecovery<br/>(aqi, pm25, sensitivity)"]
    
    HI --> BODY["🔥 estimateBodyTempIncrease<br/>(heatIndex, activity)"]
    HI --> REC["📋 getRecommendation<br/>(aqi, heatIndex, sensitivity)"]

    subgraph HEAT_INDEX_CALC["Heat Index Calculation"]
        T1{"temp < 80°F?"} -->|Yes| SIMPLE["Simple Formula<br/>0.5 × (T + 61 + ...)"]
        T1 -->|No| COMPLEX["Rothfusz Regression<br/>-42.379 + 2.049T + 10.143H - ..."]
        SIMPLE --> HI_OUT["Heat Index °C"]
        COMPLEX --> HI_OUT
    end

    subgraph BODY_TEMP["Body Temp Increase"]
        ACT1{"Activity Type?"} -->|"Running/Gym"| B1["+0.8°C base"]
        ACT1 -->|"Walking/Commuting"| B2["+0.3°C base"]
        B1 --> HI_CHECK{"HeatIndex > 32°C?"}
        B2 --> HI_CHECK
        HI_CHECK -->|Yes| EXTRA["+ (HI - 32) × 0.05"]
        HI_CHECK -->|No| FINAL_TEMP["Final Temp Increase"]
        EXTRA --> FINAL_TEMP
    end

    subgraph HYDRATION_CALC["Hydration Calculation"]
        BASE["Base: 200 ml/hr"]
        ACT2{"Activity?"} -->|Running| R["+500 ml"]
        ACT2 -->|Gym| G["+400 ml"]
        ACT2 -->|Walking| W["+200 ml"]
        ACT2 -->|Commuting| C["+100 ml"]
        R & G & W & C --> TEMP_CHECK{"Temp > 25°C?"}
        TEMP_CHECK -->|Yes| HEAT_ADD["+ (temp-25) × 20 ml"]
        TEMP_CHECK -->|No| FINAL_ML["Final ml/hr"]
        HEAT_ADD --> FINAL_ML
    end

    subgraph LUNG_CALC["Lung Recovery Calculation"]
        LB["Base: 1.0 hr"]
        AQI_CHECK{"AQI > 50?"}
        AQI_CHECK -->|Yes| AQI_ADD["+ (AQI-50) × 0.02 hrs"]
        AQI_CHECK -->|No| SENSE_CHECK{"Asthma Sensitive?"}
        AQI_ADD --> SENSE_CHECK
        SENSE_CHECK -->|Yes| MULTIPLY["× 1.5"]
        SENSE_CHECK -->|No| FINAL_LR["Final Recovery Time"]
        MULTIPLY --> FINAL_LR
    end

    subgraph RECOMMENDATION["Safety Recommendation"]
        COND1{"AQI > 150 OR<br/>HeatIndex > 38°C?"} -->|Yes| RED["🔴 RED<br/>Dangerous — Avoid Outdoors"]
        COND1 -->|No| COND2{"AQI > 100 OR HI > 32<br/>OR Asthma+AQI>50<br/>OR HeatSens+HI>28?"}
        COND2 -->|Yes| YELLOW["🟡 YELLOW<br/>Moderate — Reduce Intensity"]
        COND2 -->|No| GREEN["🟢 GREEN<br/>Great Conditions!"]
    end

    BODY --> OUTPUT["📤 Final Prediction Output"]
    HY --> OUTPUT
    LR --> OUTPUT
    REC --> OUTPUT

    style RED fill:#ef4444,color:#fff
    style YELLOW fill:#f59e0b,color:#000
    style GREEN fill:#10b981,color:#000
```

---

## 5. Database Schema & Data Flow

```mermaid
erDiagram
    PredictionLog {
        ObjectId _id PK
        String city
        Object weather
        Object aqi
        Object prediction
        Object user_input
        Date createdAt
    }

    Weather {
        Float temperature
        Float humidity
        Float wind_speed
        Float uv_index
    }

    AQI {
        Int aqi
        Float pm25
        Float pm10
        Float no2
        Float o3
    }

    Prediction {
        Float heat_index
        Float temp_increase
        Int hydration_req_ml_hr
        Float lung_recovery_time_hrs
        String activity_recommendation
        String safety_level
    }

    UserInput {
        String city
        String activity_type
        String health_sensitivity
    }

    PredictionLog ||--|| Weather : "contains"
    PredictionLog ||--|| AQI : "contains"
    PredictionLog ||--|| Prediction : "contains"
    PredictionLog ||--|| UserInput : "contains"
```

```mermaid
flowchart LR
    subgraph DB_FLOW["Database Connection Flow"]
        START["App Starts"] --> TRY["Try Connect"]
        TRY --> MEM["MongoMemoryServer.create()"]
        MEM --> URI["Get In-Memory URI"]
        URI --> CONNECT["mongoose.connect(uri)"]
        CONNECT --> SUCCESS["✅ Connected<br/>(Local Memory Server)"]
        TRY -->|Error| FALLBACK["⚠️ Start without DB<br/>App continues to work"]
    end

    style SUCCESS fill:#10b981,color:#000
    style FALLBACK fill:#f59e0b,color:#000
```

---

## 6. Frontend Component Architecture

```mermaid
graph TD
    subgraph ENTRY["Entry Point"]
        MAIN["main.jsx<br/>ReactDOM.createRoot"]
    end

    subgraph ROUTER["Router Layer — App.jsx"]
        NAV["Navigation Bar<br/>🔗 Dashboard | Predict | Air Quality"]
        BG["Animated Background Blobs<br/>(Framer Motion)"]
        ROUTES["AnimatePresence + Routes"]
    end

    subgraph PAGES["Pages"]
        P1["/ → Home.jsx<br/>📊 Weather Dashboard"]
        P2["/predict → InputForm.jsx<br/>🤖 AI Prediction Form"]
        P3["/results → PredictionDashboard.jsx<br/>📈 Results Display"]
        P4["/air-quality → AirQuality.jsx<br/>💨 Pollutant Charts"]
    end

    subgraph COMPONENTS["Reusable Components"]
        C1["Card.jsx<br/>Glassmorphism Card<br/>+ Hover Glow Effect"]
        C2["StatusBadge.jsx<br/>🟢 Safe | 🟡 Moderate | 🔴 Danger"]
    end

    subgraph SERVICES["Data Layer"]
        S1["api.js<br/>fetchWeather() | fetchAqi() | fetchPredictions()"]
    end

    subgraph LIBS["Libraries"]
        L1["Recharts<br/>BarChart"]
        L2["Framer Motion<br/>Animations"]
        L3["Lucide React<br/>Icons"]
        L4["Tailwind CSS<br/>Styling"]
        L5["Axios<br/>HTTP Client"]
    end

    MAIN --> ROUTER
    ROUTER --> ROUTES
    ROUTES --> P1 & P2 & P3 & P4
    P1 --> C1 & C2 & S1
    P2 --> C1 & S1
    P3 --> C1
    P4 --> C1 & S1 & L1
    S1 --> L5
    P1 & P2 & P3 & P4 --> L2 & L3
```

---

## 7. API Endpoints Reference

| Method | Endpoint | Parameters | Description | Response |
|--------|----------|------------|-------------|----------|
| `GET` | `/` | — | Health check | `{ message: "Welcome to AtmoSense AI" }` |
| `GET` | `/weather` | `?city=London` | Get real-time weather | `{ temperature, humidity, wind_speed, uv_index }` |
| `GET` | `/air-quality` | `?city=London` | Get AQI & pollutants | `{ aqi, pm25, pm10, no2, o3 }` |
| `POST` | `/predict` | Body: `{ city, activity_type, health_sensitivity }` | Run AI predictions | Full `PredictionLog` document |

---

## 8. Feature Coverage Matrix

| Feature | Frontend Page | Backend Module | External API | Database |
|---------|--------------|----------------|--------------|----------|
| 🌡️ Live Temperature Display | `Home.jsx` | `services.js → fetchWeather` | OpenWeatherMap | — |
| 💧 Humidity Tracking | `Home.jsx` | `services.js → fetchWeather` | OpenWeatherMap | — |
| 🌬️ Wind Speed Display | `Home.jsx` | `services.js → fetchWeather` | OpenWeatherMap | — |
| ☀️ UV Index Display | `Home.jsx` | `services.js → fetchWeather` | OpenWeatherMap | — |
| 💨 AQI Tracker | `Home.jsx` + `AirQuality.jsx` | `services.js → fetchAqi` | WAQI | — |
| 📊 Pollutant Bar Charts | `AirQuality.jsx` (Recharts) | `services.js → fetchAqi` | WAQI | — |
| 🔥 Heat Index Calculator | `PredictionDashboard.jsx` | `predictions.js → calculateHeatIndex` | — | — |
| 🌡️ Body Temp Increase Estimator | `PredictionDashboard.jsx` | `predictions.js → estimateBodyTempIncrease` | — | — |
| 💧 Hydration Alert | `PredictionDashboard.jsx` | `predictions.js → calculateHydration` | — | — |
| 🫁 Lung Recovery Time | `PredictionDashboard.jsx` | `predictions.js → calculateLungRecovery` | — | — |
| 🟢🟡🔴 Activity Safety Recommendation | `PredictionDashboard.jsx` | `predictions.js → getRecommendation` | — | — |
| 🔍 City Search | `Home.jsx` + `AirQuality.jsx` | All endpoints accept `city` | — | — |
| 📝 Prediction Logging | — | `index.js → POST /predict` | — | MongoDB `PredictionLog` |
| 🎭 Mock Data Fallback | — | `services.js` (auto-detect no keys) | — | — |
| ✨ Animated Transitions | `App.jsx` + all pages (Framer Motion) | — | — | — |
| 🪟 Glassmorphism UI | `Card.jsx` + `index.css` | — | — | — |
| 📱 Responsive Design | All pages (Tailwind breakpoints) | — | — | — |

---

## 9. Technology Stack Overview

```mermaid
graph LR
    subgraph FRONTEND_STACK["Frontend Stack"]
        REACT["React.js 18"]
        VITE["Vite"]
        TAILWIND["Tailwind CSS"]
        FRAMER["Framer Motion"]
        RECHARTS["Recharts"]
        LUCIDE["Lucide React"]
        AXIOS_FE["Axios"]
    end

    subgraph BACKEND_STACK["Backend Stack"]
        NODE["Node.js"]
        EXPRESS_S["Express.js"]
        MONGOOSE["Mongoose ODM"]
        AXIOS_BE["Axios"]
        DOTENV["dotenv"]
        CORS["CORS Middleware"]
        MMS["mongodb-memory-server"]
    end

    subgraph INFRA["Infrastructure"]
        MONGO_ATLAS["MongoDB Atlas<br/>(Cloud DB)"]
        OW_API["OpenWeatherMap"]
        WAQI_API["WAQI"]
    end

    REACT --- VITE
    REACT --- TAILWIND
    REACT --- FRAMER
    REACT --- RECHARTS
    REACT --- LUCIDE
    REACT --- AXIOS_FE
    
    NODE --- EXPRESS_S
    NODE --- MONGOOSE
    NODE --- AXIOS_BE
    NODE --- DOTENV
    NODE --- CORS
    NODE --- MMS

    MONGOOSE --- MONGO_ATLAS
    AXIOS_BE --- OW_API
    AXIOS_BE --- WAQI_API
    AXIOS_FE ---|"HTTP REST"| EXPRESS_S
```

---

## 10. Complete End-to-End Data Flow (Prediction Feature)

```mermaid
flowchart TD
    A["👤 User fills form<br/>City: Mumbai<br/>Activity: Running<br/>Health: Asthma Sensitive"] 
    --> B["📡 POST /predict<br/>{city, activity_type, health_sensitivity}"]
    --> C["⚙️ Express receives request"]
    --> D["📡 Parallel: fetchWeather + fetchAqi"]
    
    D --> E1["🌤️ Weather Data<br/>temp: 33.2°C, humidity: 72%<br/>wind: 8.1 m/s, uv: 7.3"]
    D --> E2["💨 AQI Data<br/>aqi: 112, pm25: 44.8<br/>pm10: 67.2, o3: 34.5"]
    
    E1 & E2 --> F["🧠 runPredictions()"]
    
    F --> G1["Heat Index: 38.7°C"]
    F --> G2["Body Temp Increase: +1.14°C"]
    F --> G3["Hydration: 864 ml/hr"]
    F --> G4["Lung Recovery: 2.9 hrs"]
    F --> G5["🟡 YELLOW — Reduce Intensity"]
    
    G1 & G2 & G3 & G4 & G5 --> H["💾 Save to MongoDB<br/>PredictionLog document"]
    H --> I["📤 JSON Response to Frontend"]
    I --> J["🖥️ Navigate to /results"]
    
    J --> K1["🔥 Heat Index Card: 38.7°C"]
    J --> K2["💧 Hydration Card: 864 ml/hr"]
    J --> K3["🫁 Lung Recovery Bar: 2.9 hrs"]
    J --> K4["🟡 AI Recommendation Banner"]

    style A fill:#6366f1,color:#fff
    style G5 fill:#f59e0b,color:#000
    style K4 fill:#f59e0b,color:#000
```

---

> **Summary**: AtmoSense AI is a full-stack MERN application that combines real-time weather and air quality data with an AI prediction engine to deliver personalized health and outdoor activity insights. The system features 3 API endpoints, 5 prediction algorithms, 4 frontend pages, mock data fallback, MongoDB persistence, and a premium glassmorphism UI with animated transitions.
