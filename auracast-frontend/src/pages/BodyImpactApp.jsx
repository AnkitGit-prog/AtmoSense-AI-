import React, { useState } from 'react';
import BodyImpactOnboarding from './BodyImpactOnboarding';
import BodyImpactDashboard from './BodyImpactDashboard';

export default function BodyImpactApp() {
  const [impactData, setImpactData] = useState(null);

  if (impactData) {
    return <BodyImpactDashboard data={impactData} onReset={() => setImpactData(null)} />;
  }

  return <BodyImpactOnboarding onDataFetched={setImpactData} />;
}
