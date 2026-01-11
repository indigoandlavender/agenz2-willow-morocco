/**
 * TIFORT-CORE: Travel Alpha Calculator
 *
 * Calculates the "Yield Gap" between public OTA rates and forensically
 * negotiated rates based on occupancy analysis and operational audits.
 */

export interface TravelAsset {
  id: string;
  assetName: string;
  location: { district: string; city: string };
  operationalHealth: {
    wifiSpeed: number;
    safetyGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    accessibilityScore: number;
  };
  pricing: {
    publicRateBooking: number;
    publicRateAirbnb: number;
    forensicNegotiatedRate: number;
    currency: string;
  };
  capacity: { rooms: number; maxGuests: number; bathrooms: number };
  occupancy: {
    currentRate: number;
    averageMonthly: number;
    gapDays: number;
  };
  auditData: {
    ownerReliability: 1 | 2 | 3 | 4 | 5;
    safetyChecklist: { id: string; checked: boolean }[];
    lastAuditDate: string;
  };
}

export interface TravelAlphaResult {
  assetId: string;
  publicRateAvg: number;
  forensicRate: number;
  absoluteGap: number;
  percentageGap: number;
  annualizedAlpha: number;
  yieldOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
}

export interface CorporateReadinessScore {
  total: number;
  breakdown: {
    connectivity: number;
    safety: number;
    accessibility: number;
    reliability: number;
    standardization: number;
  };
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'UNQUALIFIED';
  fortune500Ready: boolean;
}

/**
 * Calculate Travel Alpha - The yield gap between public and negotiated rates
 */
export function calculateTravelAlpha(asset: TravelAsset): TravelAlphaResult {
  const { pricing, occupancy, id } = asset;

  const publicRateAvg = (pricing.publicRateBooking + pricing.publicRateAirbnb) / 2;
  const forensicRate = pricing.forensicNegotiatedRate;
  const absoluteGap = publicRateAvg - forensicRate;
  const percentageGap = (absoluteGap / publicRateAvg) * 100;

  // Occupancy multiplier: more gap days = more leverage
  const occupancyMultiplier = occupancy.gapDays >= 15 ? 1.4 :
                              occupancy.gapDays >= 10 ? 1.25 :
                              occupancy.gapDays >= 5 ? 1.1 : 1.0;

  const annualizedAlpha = absoluteGap * 365 * occupancyMultiplier * (occupancy.averageMonthly / 100);

  // Yield opportunity tier
  const score = percentageGap * 0.6 + occupancy.gapDays * 0.4;
  const yieldOpportunity: TravelAlphaResult['yieldOpportunity'] =
    score >= 25 ? 'HIGH' : score >= 15 ? 'MEDIUM' : 'LOW';

  // Generate recommendation
  const recommendedAction = generateRecommendation(percentageGap, occupancy.gapDays, asset.auditData.ownerReliability);

  return {
    assetId: id,
    publicRateAvg: round(publicRateAvg, 2),
    forensicRate: round(forensicRate, 2),
    absoluteGap: round(absoluteGap, 2),
    percentageGap: round(percentageGap, 1),
    annualizedAlpha: round(annualizedAlpha, 0),
    yieldOpportunity,
    recommendedAction,
  };
}

function generateRecommendation(percentageGap: number, gapDays: number, ownerReliability: number): string {
  if (percentageGap >= 30 && gapDays >= 10 && ownerReliability >= 4) {
    return 'PRIORITY: Lock in 12-month exclusive. High alpha, reliable partner.';
  }
  if (percentageGap >= 20 && ownerReliability >= 3) {
    return 'NEGOTIATE: Strong margin potential. Propose 6-month trial.';
  }
  if (gapDays >= 15) {
    return 'LEVERAGE: High vacancy. Push for 25%+ discount on guaranteed bookings.';
  }
  if (ownerReliability <= 2) {
    return 'CAUTION: Owner reliability concern. Short-term agreements only.';
  }
  return 'MONITOR: Standard opportunity. Re-audit in 90 days.';
}

/**
 * Calculate Corporate Readiness Score
 * Determines if an asset meets Fortune 500 standards for World Cup 2030
 */
export function calculateCorporateReadiness(asset: TravelAsset): CorporateReadinessScore {
  const { operationalHealth, auditData, capacity } = asset;

  // Connectivity (25 pts)
  const connectivity = operationalHealth.wifiSpeed >= 100 ? 25 :
                       operationalHealth.wifiSpeed >= 50 ? 20 :
                       operationalHealth.wifiSpeed >= 25 ? 15 :
                       operationalHealth.wifiSpeed >= 10 ? 10 : 5;

  // Safety (30 pts)
  const gradeScores: Record<string, number> = { A: 20, B: 15, C: 10, D: 5, F: 0 };
  const checklistScore = auditData.safetyChecklist.filter(i => i.checked).length;
  const safety = (gradeScores[operationalHealth.safetyGrade] || 0) +
                 (checklistScore / (auditData.safetyChecklist.length || 1)) * 10;

  // Accessibility (20 pts)
  const accessibility = Math.min(operationalHealth.accessibilityScore * 0.2, 20);

  // Reliability (15 pts)
  const reliability = (auditData.ownerReliability / 5) * 15;

  // Standardization (10 pts)
  let standardization = 0;
  const daysSinceAudit = (Date.now() - new Date(auditData.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceAudit <= 90) standardization += 4;
  else if (daysSinceAudit <= 180) standardization += 2;
  if (capacity.rooms >= 5) standardization += 3;
  else if (capacity.rooms >= 3) standardization += 2;
  if (capacity.bathrooms >= capacity.rooms) standardization += 3;

  const total = round(connectivity + safety + accessibility + reliability + standardization, 0);

  // Determine tier
  const { wifiSpeed, safetyGrade } = operationalHealth;
  let tier: CorporateReadinessScore['tier'];
  if (total >= 90 && wifiSpeed >= 100 && safetyGrade === 'A') tier = 'PLATINUM';
  else if (total >= 80 && wifiSpeed >= 50 && safetyGrade === 'A') tier = 'GOLD';
  else if (total >= 70 && wifiSpeed >= 25 && ['A', 'B'].includes(safetyGrade)) tier = 'SILVER';
  else if (total >= 60) tier = 'BRONZE';
  else tier = 'UNQUALIFIED';

  return {
    total,
    breakdown: {
      connectivity: round(connectivity, 1),
      safety: round(safety, 1),
      accessibility: round(accessibility, 1),
      reliability: round(reliability, 1),
      standardization: round(standardization, 1),
    },
    tier,
    fortune500Ready: tier === 'PLATINUM' || tier === 'GOLD',
  };
}

/**
 * Analyze portfolio for consolidated reporting
 */
export function analyzePortfolio(assets: TravelAsset[]) {
  const alphas = assets.map(calculateTravelAlpha);
  const readiness = assets.map(calculateCorporateReadiness);

  const totalAnnualAlpha = alphas.reduce((sum, a) => sum + a.annualizedAlpha, 0);
  const avgPercentageGap = alphas.reduce((sum, a) => sum + a.percentageGap, 0) / alphas.length;
  const fortune500Count = readiness.filter(r => r.fortune500Ready).length;
  const avgReadinessScore = readiness.reduce((sum, r) => sum + r.total, 0) / readiness.length;

  return {
    summary: {
      totalAssets: assets.length,
      totalAnnualAlpha: round(totalAnnualAlpha, 0),
      avgPercentageGap: round(avgPercentageGap, 1),
      fortune500ReadyCount: fortune500Count,
      fortune500ReadyPercent: round((fortune500Count / assets.length) * 100, 1),
      avgReadinessScore: round(avgReadinessScore, 0),
    },
    tierDistribution: {
      PLATINUM: readiness.filter(r => r.tier === 'PLATINUM').length,
      GOLD: readiness.filter(r => r.tier === 'GOLD').length,
      SILVER: readiness.filter(r => r.tier === 'SILVER').length,
      BRONZE: readiness.filter(r => r.tier === 'BRONZE').length,
      UNQUALIFIED: readiness.filter(r => r.tier === 'UNQUALIFIED').length,
    },
    assets: assets.map((asset, i) => ({ ...asset, alpha: alphas[i], readiness: readiness[i] })),
    highPriorityTargets: alphas.filter(a => a.yieldOpportunity === 'HIGH').map(a => a.assetId),
  };
}

/**
 * Calculate management fee for consolidated corporate booking (15% certainty premium)
 */
export function calculateManagementFee(
  assets: TravelAsset[],
  bookingNights: number,
  feePercent = 15
) {
  const totalPublicCost = assets.reduce((sum, asset) => {
    const avgPublic = (asset.pricing.publicRateBooking + asset.pricing.publicRateAirbnb) / 2;
    return sum + (avgPublic * bookingNights * asset.capacity.rooms);
  }, 0);

  const totalForensicCost = assets.reduce((sum, asset) =>
    sum + (asset.pricing.forensicNegotiatedRate * bookingNights * asset.capacity.rooms), 0);

  const managementFee = totalForensicCost * (feePercent / 100);
  const netClientCost = totalForensicCost + managementFee;

  return {
    totalPublicCost: round(totalPublicCost, 2),
    totalForensicCost: round(totalForensicCost, 2),
    managementFee: round(managementFee, 2),
    clientSavings: round(totalPublicCost - netClientCost, 2),
    netClientCost: round(netClientCost, 2),
    tifortRevenue: round(managementFee, 2),
  };
}

function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
