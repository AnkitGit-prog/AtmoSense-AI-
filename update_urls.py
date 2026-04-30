import os
import re

base_dir = r"c:\Users\INDIA TECHNOLOGY\Desktop\MINI Project\auracast-frontend\src\pages"
files = ["RainPrediction.jsx", "Home.jsx", "ExposureTracker.jsx", "BodyImpactOnboarding.jsx", "AirQuality.jsx"]

for file in files:
    path = os.path.join(base_dir, file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace template literal version: `http://localhost:5000/...`
    content = re.sub(
        r"`http://localhost:5000(.*?)`",
        r"`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}\1`",
        content
    )
    
    # Replace string version: 'http://localhost:5000/get-impact'
    content = re.sub(
        r"'http://localhost:5000(.*?)'",
        r"(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}\1` : 'http://localhost:5000\1')",
        content
    )
    
    # Also handle double quote version just in case
    content = re.sub(
        r'"http://localhost:5000(.*?)"',
        r"(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}\1` : 'http://localhost:5000\1')",
        content
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {file}")
