# Market Consolidation Tracking - Architecture Industry Intelligence

**Purpose:** Comprehensive tracking and analysis of market consolidation in the global architecture industry

---

## Overview

Market consolidation occurs when fewer, larger firms control an increasing share of the market. This document defines all metrics, data categories, and tracking methods for analyzing consolidation trends in the architecture industry.

---

## The 7 Categories of Consolidation Data

### **Category 1: Merger & Acquisition Events**

**What We Track:**
- Acquisition dates and timelines
- Acquiring firm (office ID in CCccNNN format)
- Acquired firm (office ID in CCccNNN format)
- Deal value ($USD)
- Deal structure (acquisition, merger, partnership)
- Post-merger integration status
- Employees retained vs. laid off
- Brand retention (kept separate brand vs. absorbed into parent)
- Market reaction (competitor responses, client reactions)

**Consolidation Signals:**
- ✅ **Increasing M&A activity** = Market consolidating
- ✅ **Large firms acquiring boutiques** = Concentration increasing
- ✅ **Brand absorption** (not retained) = Fewer independent players
- ✅ **Rising deal values** = Firms willing to pay more for market share
- ✅ **Serial acquirers** = Dominant firms growing through M&A

**Data Sources:**
- `/archHistory` collection → `consolidationEvent` object
- `/relationships` collection → relationshipType: "acquired" or "merged"
- `/offices` collection → status: "acquired" or "dissolved"

**Example Query:**
```typescript
// Get all acquisitions in the last 2 years
db.collection('archHistory')
  .where('eventType', '==', 'acquisition')
  .where('date', '>=', twoYearsAgo)
  .orderBy('date', 'desc')
  .get()
```

---

### **Category 2: Market Share Shifts**

**What We Track:**
- **Revenue concentration:** Top 10 firms % of total market revenue
- **Project count concentration:** % of projects by firm size category
- **Geographic monopolies:** Single firm dominating a specific city/region
- **Sector dominance:** Firm controlling >30% of a specific field (cultural, commercial, residential, etc.)
- **Top 4 concentration (CR4):** Market share % of top 4 firms
- **Market share changes:** Period-over-period shifts

**Consolidation Signals:**
- ✅ **Rising CR4 ratio** (>60%) = Oligopolistic market
- ✅ **Increasing revenue concentration** = Fewer firms controlling more
- ✅ **Geographic monopolies forming** = Regional consolidation
- ✅ **Sector dominance by single firm** = Vertical consolidation
- ✅ **Declining mid-tier firms** = Polarization (big winners, small strugglers)

**Data Sources:**
- `/projects` collection → officeId, financial.budget
- `/financials` collection → revenue records by office
- `/offices` collection → size.annualRevenue
- `/marketIntelligence` collection → marketShare.leaders[], consolidation.top4Concentration

**Metrics Computed:**
```typescript
// Top 4 Concentration Ratio (CR4)
const totalMarketRevenue = sumAllOfficeRevenue();
const top4Revenue = sumTopNOfficeRevenue(4);
const cr4 = (top4Revenue / totalMarketRevenue) * 100;

// Revenue concentration by firm size
const largeFiremsRevenue = sumRevenueBySize('large', 'global');
const concentration = (largeFiremsRevenue / totalMarketRevenue) * 100;
```

---

### **Category 3: Pricing Power Indicators**

**What We Track:**
- **Fee premium changes:** Top firms vs. market average pricing
- **Premium index:** How much more (%) top firms charge
- **Bidding competition reduction:** Average number of firms per RFP over time
- **Client switching rate:** How often clients change architecture firms
- **Price-to-quality ratio:** Whether premiums justify quality
- **Pricing trends:** Rising, stable, or declining

**Consolidation Signals:**
- ✅ **Increasing premium index** = Top firms can charge more (pricing power)
- ✅ **Fewer bidders per RFP** = Less competition, more concentration
- ✅ **Declining switching rate** = Client lock-in by dominant firms
- ✅ **Price divergence** = Growing gap between top and average firms
- ✅ **Stable high premiums** = Entrenched market leaders

**Data Sources:**
- `/projects` collection → financial.budget (project fees)
- `/financials` collection → revenue per project
- `/clients` collection → preferredOffices[], relationshipQuality
- `/marketIntelligence` collection → pricing.premiumIndex, competitiveIntensity.avgBiddersPerRFP

**Metrics Computed:**
```typescript
// Premium Index
const topFirmsAvgFee = calculateAvgFee(topTierOffices);
const marketAvgFee = calculateAvgFee(allOffices);
const premiumIndex = ((topFirmsAvgFee - marketAvgFee) / marketAvgFee) * 100;

// Average bidders per RFP (declining = consolidation)
const totalRFPs = countRFPs(timeframe);
const totalBidders = countUniqueBidders(timeframe);
const avgBiddersPerRFP = totalBidders / totalRFPs;

// Client switching rate (declining = lock-in)
const clientsSwitched = countClientsSwitchingFirms(year);
const totalClients = countAllClients();
const switchingRate = (clientsSwitched / totalClients) * 100;
```

---

### **Category 4: Barrier to Entry Signals**

**What We Track:**
- **New firm formation rate:** # of new firms founded per year
- **Small firm survival rate:** % of boutique firms still operating after 5 years
- **Firm closures:** # of firms dissolving per year
- **Capital requirements escalation:** Rising costs of technology, talent, operations
- **Technology adoption costs:** BIM, AI, parametric software costs
- **Talent acquisition costs:** Competition for top architects/designers
- **Entry barrier classification:** Low, medium, or high

**Consolidation Signals:**
- ✅ **Declining new firm rate** = Harder to enter market
- ✅ **Declining survival rate** = Small firms can't compete
- ✅ **Rising capital requirements** = Only large firms can afford tech/talent
- ✅ **Increasing closures** = Market pressure from consolidation
- ✅ **High barrier classification** = Entrenched incumbents

**Data Sources:**
- `/offices` collection → founded (year), status (active/dissolved)
- `/technology` collection → adoptionDate, roi.costSavings (initial costs)
- `/workforce` collection → talentSources, retentionRate
- `/financials` collection → capital expenditures, operating costs
- `/marketIntelligence` collection → consolidation.barrierToEntry, consolidation.newFirmFormationRate

**Metrics Computed:**
```typescript
// New firm formation rate
const newFirmsThisYear = countOffices({ founded: currentYear });
const newFirmsLastYear = countOffices({ founded: currentYear - 1 });
const formationTrend = newFirmsThisYear - newFirmsLastYear;

// 5-year survival rate
const firmsFounded5YearsAgo = getOffices({ founded: currentYear - 5 });
const stillActive = firmsFounded5YearsAgo.filter(o => o.status === 'active');
const survivalRate = (stillActive.length / firmsFounded5YearsAgo.length) * 100;

// Capital requirements trend
const avgTechCostNow = calculateAvgTechCost(currentYear);
const avgTechCost5YearsAgo = calculateAvgTechCost(currentYear - 5);
const capitalEscalation = ((avgTechCostNow - avgTechCost5YearsAgo) / avgTechCost5YearsAgo) * 100;
```

---

### **Category 5: Network Centralization**

**What We Track:**
- **Client concentration:** How many clients are served by how few firms
- **Client-to-firm ratio:** Average clients per firm (rising = centralization)
- **Supplier exclusivity deals:** # of exclusive supplier-to-office contracts
- **Talent concentration:** % of top talent employed by large firms
- **Talent poaching patterns:** Boutique → large firm movement
- **Network centrality scores:** Which firms are most connected (influence)

**Consolidation Signals:**
- ✅ **Rising client concentration** = Few firms serving many clients
- ✅ **More exclusivity deals** = Suppliers locked to dominant firms
- ✅ **Talent centralizing** = Large firms absorbing boutique expertise
- ✅ **High network centrality** = Few firms are critical nodes
- ✅ **Declining boutique independence** = Absorbed into larger networks

**Data Sources:**
- `/relationships` collection → client-of, supplier-to relationships
- `/clients` collection → preferredOffices[] (concentration)
- `/supplyChain` collection → relationships[], exclusivity
- `/workforce` collection → talentSources, keyPersonnel movements
- `/networkGraph` collection → centrality.influence, connections.totalConnections
- `/marketIntelligence` collection → competitiveIntensity.exclusivityDeals

**Metrics Computed:**
```typescript
// Client concentration (Herfindahl for client distribution)
const clientsByFirm = groupClientsByOffice();
const clientHHI = calculateHHI(clientsByFirm.map(f => f.clientCount));

// Supplier exclusivity rate
const totalSupplierRelationships = countAllSupplierRelationships();
const exclusiveDeals = countExclusiveDeals();
const exclusivityRate = (exclusiveDeals / totalSupplierRelationships) * 100;

// Talent centralization
const topTalentAtLargeFirms = countTopTalent(largeFirms);
const totalTopTalent = countAllTopTalent();
const talentCentralization = (topTalentAtLargeFirms / totalTopTalent) * 100;
```

---

### **Category 6: Strategic Behavior Patterns**

**What We Track:**
- **Joint ventures:** # and type of collaborative projects
- **Partnership formations:** Strategic alliances between firms
- **Non-compete agreements:** Prevalence in the market
- **Cross-market expansion:** Firms entering new geographies
- **Cross-sector expansion:** Firms entering new specializations
- **Cooperative vs. competitive relationships:** Ratio over time
- **Market entry attempts:** New geographies/sectors targeted

**Consolidation Signals:**
- ✅ **More partnerships** = Market maturing, firms collaborating
- ✅ **Geographic expansion by large firms** = Market share grab
- ✅ **Cross-sector expansion** = Firms diversifying to dominate
- ✅ **Increasing cooperation** = Less competition, more oligopolistic behavior
- ✅ **Defensive partnerships** = Small firms banding together vs. large

**Data Sources:**
- `/relationships` collection → relationshipType: "partner", "collaborator"
- `/offices` collection → otherOffices[] (geographic expansion), specializations[] (sector expansion)
- `/projects` collection → location (market entry tracking)
- `/marketIntelligence` collection → consolidation.partnerships[]

**Metrics Computed:**
```typescript
// Geographic expansion rate
const firmsWithMultipleLocations = countOffices({ otherOffices: { size: >0 } });
const expansionRate = (firmsWithMultipleLocations / totalFirms) * 100;

// Cross-sector expansion
const multiSpecializationFirms = countOffices({ specializations: { size: >3 } });
const diversificationRate = (multiSpecializationFirms / totalFirms) * 100;

// Partnership formation rate
const partnershipsThisYear = countRelationships({ 
  relationshipType: 'partner',
  year: currentYear 
});
const partnershipTrend = partnershipsThisYear - partnershipsLastYear;
```

---

### **Category 7: Time-Series Mathematical Metrics**

**What We Track:**

#### **A. Herfindahl-Hirschman Index (HHI)**
**Formula:** HHI = Σ(market share²) × 10,000  
**Range:** 0 - 10,000  
**Interpretation:**
- 0-1,500: Competitive market
- 1,500-2,500: Moderately concentrated
- 2,500-10,000: Highly concentrated
- >2,500: Potential antitrust concern

**Tracked Over Time:** Monthly, quarterly, annually  
**Consolidation Signal:** Rising HHI = market consolidating

---

#### **B. Gini Coefficient**
**Formula:** Gini = (Σ|xi - xj|) / (2n²μ)  
**Range:** 0 - 1  
**Interpretation:**
- 0: Perfect equality (all firms equal revenue)
- 0.3-0.4: Relatively equal distribution
- 0.4-0.6: Moderate inequality
- 0.6-1.0: High inequality (few firms dominate)

**Tracked Over Time:** Quarterly, annually  
**Consolidation Signal:** Rising Gini = increasing inequality, consolidation

---

#### **C. CR4 (Top 4 Concentration Ratio)**
**Formula:** CR4 = (Top 4 firms revenue / Total market revenue) × 100  
**Range:** 0% - 100%  
**Interpretation:**
- <40%: Competitive market
- 40-60%: Moderate oligopoly
- >60%: Tight oligopoly (consolidated)

**Tracked Over Time:** Quarterly, annually  
**Consolidation Signal:** Rising CR4 = oligopolistic consolidation

---

#### **D. CR8 (Top 8 Concentration Ratio)**
**Formula:** CR8 = (Top 8 firms revenue / Total market revenue) × 100  
**Used For:** Secondary concentration measure

---

#### **E. Lerner Index (Price-Cost Margin)**
**Formula:** L = (Price - Marginal Cost) / Price  
**Range:** 0 - 1  
**Interpretation:**
- 0: Perfect competition (no markup)
- 0.2-0.4: Competitive
- >0.5: Strong pricing power (consolidated market)

**Tracked Over Time:** Annually  
**Consolidation Signal:** Rising Lerner = pricing power from consolidation

---

#### **F. Firm Survival Curves**
**Tracks:** % of firms surviving over time by size category  
**Kaplan-Meier Estimation:**
- Boutique firm 5-year survival rate
- Medium firm 5-year survival rate
- Large firm 5-year survival rate
- Time to acquisition or closure

**Consolidation Signal:** Declining survival for small firms = consolidation pressure

---

#### **G. Market Growth Rate**
**Formula:** Growth Rate = ((Current Period Revenue - Previous Period Revenue) / Previous Period Revenue) × 100  
**Context:** Consolidation can occur in growing OR declining markets

---

#### **H. Firm Entry/Exit Rates**
**Entry Rate:** New firms founded / Total existing firms  
**Exit Rate:** Firms dissolved or acquired / Total existing firms  
**Net Entry Rate:** Entry Rate - Exit Rate

**Consolidation Signal:** Negative net entry rate = consolidation

---

### **Data Sources & Storage**

| Metric | Computed From | Stored In |
|--------|---------------|-----------|
| HHI | offices, projects, financials | marketIntelligence.consolidation.hhiIndex |
| Gini Coefficient | offices, financials (revenue) | marketIntelligence.consolidation.giniCoefficient |
| CR4 | offices, financials (revenue) | marketIntelligence.consolidation.top4Concentration |
| CR8 | offices, financials (revenue) | marketIntelligence.consolidation.top8Concentration |
| Lerner Index | projects.financial, financials | marketIntelligence.pricing.premiumIndex |
| Survival Curves | offices (founded, status) | marketIntelligence.consolidation.survivalMetrics |
| Growth Rate | financials (period comparison) | financialMetrics.metrics.growthRate |
| Entry/Exit Rates | offices (founded, status) | marketIntelligence.consolidation.newFirmFormationRate |

---

## Additional Consolidation Metrics

### **Market Concentration Metrics**

#### **1. Market Share Distribution**
**Tracks:** How revenue is distributed across all firms  
**Visualizations:**
- Lorenz curve (cumulative % of firms vs. cumulative % of revenue)
- Pareto chart (80/20 rule: do 20% of firms generate 80% of revenue?)

#### **2. Dominance Index**
**Formula:** DI = Market share of largest firm / Market share of 2nd largest firm  
**Interpretation:**
- DI < 2: Competitive duopoly
- DI 2-4: Moderate dominance
- DI > 4: Clear market leader

#### **3. Instability Index**
**Tracks:** Volatility in market share rankings  
**Formula:** Count of firms changing ranking positions period-over-period  
**Consolidation Signal:** Decreasing instability = entrenched positions

---

### **Pricing Power Metrics**

#### **1. Premium Index**
**Formula:** (Top tier avg fee - Market avg fee) / Market avg fee × 100  
**Stored:** marketIntelligence.pricing.premiumIndex  
**Consolidation Signal:** Rising premium = pricing power

#### **2. Bidding Competition Intensity**
**Tracks:** Average bidders per project RFP  
**Stored:** marketIntelligence.competitiveIntensity.avgBiddersPerRFP  
**Consolidation Signal:** Declining bidders = less competition

#### **3. Client Loyalty/Lock-In**
**Tracks:** % of clients working exclusively with one firm  
**Formula:** Exclusive clients / Total clients × 100  
**Consolidation Signal:** Rising exclusivity = client lock-in

---

### **Barrier to Entry Metrics**

#### **1. Capital Intensity**
**Tracks:** Average capital required to start/run architecture firm  
**Components:**
- Technology costs (BIM, AI, software licenses)
- Talent acquisition costs (salaries, recruiting)
- Office/infrastructure costs
- Marketing/business development costs

**Stored:** Computed from technology, workforce, financials collections  
**Consolidation Signal:** Rising capital intensity = higher barriers

#### **2. Minimum Efficient Scale (MES)**
**Tracks:** Minimum firm size needed to be cost-competitive  
**Measured By:** Employee count at which profit margins stabilize  
**Consolidation Signal:** Rising MES = small firms can't compete

#### **3. Technology Adoption Threshold**
**Tracks:** % of projects requiring advanced tech (parametric, BIM, AI)  
**Consolidation Signal:** Rising threshold = tech barrier favoring large firms

---

### **Network Centralization Metrics**

#### **1. Client Concentration HHI**
**Formula:** HHI based on client distribution across firms (not revenue)  
**Consolidation Signal:** Rising client HHI = few firms serving most clients

#### **2. Network Centrality (Graph Metrics)**
**From networkGraph collection:**
- **Degree centrality:** # of connections per firm
- **Betweenness centrality:** How often firm is bridge between others
- **Closeness centrality:** Average distance to all other firms
- **Influence score:** Computed overall influence

**Consolidation Signal:** Few firms with high centrality = centralized network

#### **3. Supplier Exclusivity Rate**
**Formula:** Exclusive supplier deals / Total supplier relationships × 100  
**Stored:** marketIntelligence.competitiveIntensity.exclusivityDeals  
**Consolidation Signal:** Rising exclusivity = large firms locking resources

---

### **Strategic Behavior Metrics**

#### **1. Partnership Formation Rate**
**Tracks:** # of new partnerships per year  
**Types:** Joint ventures, strategic alliances, co-designs  
**Consolidation Signal:** Rising partnerships = oligopolistic cooperation

#### **2. Geographic Expansion Rate**
**Tracks:** % of firms opening offices in new cities/countries  
**Consolidation Signal:** Large firms expanding = market share grab

#### **3. Vertical Integration**
**Tracks:** Firms acquiring suppliers, contractors, or related services  
**Consolidation Signal:** Vertical integration = control of value chain

---

## Firestore Collections for Consolidation

### Primary Collection: `/marketIntelligence`

**Document Structure:**
```typescript
{
  id: string,
  analysisType: 'consolidation',
  scope: {
    region: string,  // 'global', 'london', 'us-northeast', etc.
    segment: string, // 'all', 'luxury-residential', 'commercial', etc.
    timeframe: {
      start: Timestamp,
      end: Timestamp
    }
  },
  
  // MARKET SHARE DATA
  marketShare: {
    leaders: [
      { officeId: 'GBLO482', share: 12.5, change: +2.1 },
      { officeId: 'GBLO127', share: 10.3, change: +1.4 },
      // ...
    ],
    distribution: {
      'boutique': 15.2,
      'medium': 22.8,
      'large': 35.6,
      'global': 26.4
    }
  },
  
  // CONSOLIDATION METRICS
  consolidation: {
    trend: 'consolidating',  // or 'fragmenting' or 'stable'
    
    // PRIMARY METRICS
    hhiIndex: 2847,  // Highly concentrated (>2500)
    giniCoefficient: 0.62,  // High inequality
    top4Concentration: 65.3,  // Top 4 firms = 65.3% market share
    top8Concentration: 82.1,
    
    // BARRIER METRICS
    barrierToEntry: 'high',
    newFirmFormationRate: 3.2,  // Firms per year (declining)
    firmClosureRate: 8.7,  // % closing per year
    netEntryRate: -5.5,  // Negative = consolidating
    
    // M&A ACTIVITY
    acquisitions: [
      {
        acquirer: 'GBLO127',  // Foster + Partners
        target: 'GBLI234',    // Acquired boutique firm
        date: Timestamp,
        dealValue: 15000000,
        employeesRetained: 45,
        employeesLaidOff: 12,
        brandRetained: false
      },
      // ...
    ],
    
    // PARTNERSHIP DATA
    partnerships: [
      { office1: 'GBLO482', office2: 'NLRO356', type: 'joint-venture' },
      // ...
    ],
    
    // SURVIVAL METRICS
    survivalRates: {
      boutique5Year: 42.3,  // Only 42% survive 5 years
      medium5Year: 68.7,
      large5Year: 91.2,
      global5Year: 98.5
    }
  },
  
  // PRICING POWER
  pricing: {
    median: 850,  // per sq ft
    range: { min: 200, max: 3500 },
    trends: 'rising',
    premiumIndex: 145,  // Top firms charge 145% more than average
    byOffice: [
      { officeId: 'GBLO482', avgPrice: 1850, premium: 2.18 },
      // ...
    ]
  },
  
  // COMPETITIVE INTENSITY
  competitiveIntensity: {
    avgBiddersPerRFP: 3.2,  // Declining = less competition
    clientSwitchingRate: 8.4,  // % switching firms per year
    exclusivityDeals: 127  // # of exclusive contracts
  },
  
  generatedAt: Timestamp,
  dataPoints: 15847,
  createdAt: Timestamp
}
```

---

### Supporting Collection: `/archHistory`

**For M&A Events:**
```typescript
{
  eventType: 'acquisition',
  entityType: 'office',
  entityId: 'GBLI234',  // Acquired firm
  date: Timestamp,
  title: 'Foster + Partners acquires Liverpool boutique firm',
  
  consolidationEvent: {
    isMerger: false,
    isAcquisition: true,
    acquirerOfficeId: 'GBLO127',
    targetOfficeId: 'GBLI234',
    dealValue: 15000000,
    employeesRetained: 45,
    employeesLaidOff: 12,
    brandRetained: false
  },
  
  significance: 7,
  sources: ['financial-times-article', 'press-release']
}
```

---

### Supporting Collection: `/networkGraph`

**For Network Centralization:**
```typescript
{
  nodeType: 'office',
  entityId: 'GBLO482',
  
  connections: {
    totalConnections: 234,
    strongConnections: 67,  // strength > 7
    byType: {
      'clients': 89,
      'projects': 145,
      'suppliers': 34,
      'competitors': 12,
      'partners': 8
    }
  },
  
  centrality: {
    degree: 234,  // Total connections
    betweenness: 0.23,  // How often this firm bridges others
    closeness: 0.67,  // How close to all other firms
    influence: 8.9  // Overall influence score (1-10)
  },
  
  clusters: ['london-cultural', 'global-parametric']
}
```

---

## Consolidation Analysis Queries

### Query 1: Current Market Concentration
```typescript
const consolidation = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'consolidation')
  .where('scope.region', '==', 'global')
  .orderBy('generatedAt', 'desc')
  .limit(1)
  .get();

const data = consolidation.docs[0].data();
console.log(`HHI: ${data.consolidation.hhiIndex}`);
console.log(`Gini: ${data.consolidation.giniCoefficient}`);
console.log(`Top 4: ${data.consolidation.top4Concentration}%`);
console.log(`Trend: ${data.consolidation.trend}`);
```

---

### Query 2: M&A Activity Timeline
```typescript
const acquisitions = await db.collection('archHistory')
  .where('eventType', 'in', ['acquisition', 'merger'])
  .where('date', '>=', last5Years)
  .orderBy('date', 'desc')
  .get();

// Analyze: Are acquisitions accelerating?
const byYear = groupBy(acquisitions, 'year');
const trendLine = calculateTrendLine(byYear);
```

---

### Query 3: Barrier to Entry Trend
```typescript
const currentYear = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'consolidation')
  .where('scope.timeframe.end', '==', now)
  .get();

const lastYear = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'consolidation')
  .where('scope.timeframe.end', '==', oneYearAgo)
  .get();

const barrierTrend = {
  current: currentYear.consolidation.barrierToEntry,
  previous: lastYear.consolidation.barrierToEntry,
  newFirmRate: {
    current: currentYear.consolidation.newFirmFormationRate,
    previous: lastYear.consolidation.newFirmFormationRate,
    change: currentYear.consolidation.newFirmFormationRate - lastYear.consolidation.newFirmFormationRate
  }
};
```

---

### Query 4: Network Centralization
```typescript
// Who are the most influential (centralized) firms?
const topInfluencers = await db.collection('networkGraph')
  .where('nodeType', '==', 'office')
  .orderBy('centrality.influence', 'desc')
  .limit(10)
  .get();

// How centralized is the network overall?
const avgInfluence = calculateAvg(allNodes.map(n => n.centrality.influence));
const concentrationScore = topInfluencers[0].centrality.influence / avgInfluence;
```

---

### Query 5: Pricing Power Evolution
```typescript
const pricingHistory = await db.collection('marketIntelligence')
  .where('analysisType', '==', 'market-share')
  .orderBy('generatedAt', 'desc')
  .limit(20)  // Last 20 analyses (e.g., 5 years quarterly)
  .get();

const premiumTrend = pricingHistory.docs.map(doc => ({
  date: doc.data().generatedAt,
  premiumIndex: doc.data().pricing.premiumIndex
}));

// Plot premium index over time
// Rising = increasing pricing power = consolidation
```

---

## Consolidation Tracking Workflow

### Weekly/Monthly Updates

**Step 1: Collect Raw Data**
- Query all offices for revenue, project counts
- Query all M&A events from archHistory
- Query all relationships for network data
- Query all financials for pricing data

**Step 2: Compute Metrics**
```typescript
async function computeConsolidationMetrics(region: string, segment: string) {
  // Get all relevant offices
  const offices = await getOfficesInScope(region, segment);
  
  // Compute HHI
  const marketShares = offices.map(o => calculateMarketShare(o));
  const hhi = marketShares.reduce((sum, share) => sum + (share * share), 0) * 10000;
  
  // Compute Gini
  const revenues = offices.map(o => o.size.annualRevenue);
  const gini = calculateGini(revenues);
  
  // Compute CR4
  const sortedByRevenue = offices.sort((a, b) => b.annualRevenue - a.annualRevenue);
  const top4Revenue = sortedByRevenue.slice(0, 4).reduce((sum, o) => sum + o.annualRevenue, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r, 0);
  const cr4 = (top4Revenue / totalRevenue) * 100;
  
  // Compute firm formation rate
  const newFirmsThisYear = offices.filter(o => o.founded === currentYear).length;
  const formationRate = (newFirmsThisYear / offices.length) * 100;
  
  // Determine trend
  const trend = determineConsolidationTrend(hhi, gini, cr4, formationRate);
  
  return {
    hhiIndex: hhi,
    giniCoefficient: gini,
    top4Concentration: cr4,
    newFirmFormationRate: formationRate,
    trend: trend,
    barrierToEntry: classifyBarrier(formationRate, hhi)
  };
}
```

**Step 3: Save to Firestore**
```typescript
await db.collection('marketIntelligence').add({
  analysisType: 'consolidation',
  scope: { region, segment, timeframe: { start, end } },
  consolidation: computedMetrics,
  generatedAt: Timestamp.now()
});
```

**Step 4: Trigger Alerts**
```typescript
// If significant consolidation detected
if (hhi > 2500 && trend === 'consolidating') {
  await db.collection('trends').add({
    trendType: 'economic',
    name: 'Market Consolidation Accelerating',
    metrics: {
      strength: 8,
      trajectory: 'rising',
      velocity: calculateVelocity(hhiHistory)
    }
  });
}
```

---

## Consolidation Trend Classification

### Algorithm: Determine if Market is Consolidating

```typescript
function determineConsolidationTrend(
  currentHHI: number,
  previousHHI: number,
  currentGini: number,
  previousGini: number,
  cr4: number,
  formationRate: number
): 'consolidating' | 'fragmenting' | 'stable' {
  
  const hhiChange = currentHHI - previousHHI;
  const giniChange = currentGini - previousGini;
  
  // Strong consolidation signals
  if (hhiChange > 100 && giniChange > 0.05 && cr4 > 60 && formationRate < 5) {
    return 'consolidating';
  }
  
  // Fragmentation signals
  if (hhiChange < -100 && giniChange < -0.05 && formationRate > 15) {
    return 'fragmenting';
  }
  
  // Stable market
  return 'stable';
}
```

---

## Visualization Outputs

### Dashboards to Build

**1. Consolidation Overview Dashboard**
- HHI trend line (last 5 years)
- Gini coefficient trend
- CR4 bar chart
- Market share pie chart
- M&A timeline

**2. M&A Activity Dashboard**
- Acquisition count by year
- Deal value trends
- Acquirer vs. target analysis
- Employee impact (retained vs. laid off)
- Brand retention rate

**3. Pricing Power Dashboard**
- Premium index trend
- Bidders per RFP trend
- Client switching rate
- Fee distribution histogram

**4. Network Centralization Dashboard**
- Network graph visualization
- Top influencers ranking
- Client concentration chart
- Supplier exclusivity metrics

**5. Barrier to Entry Dashboard**
- New firm formation rate
- Survival curves by firm size
- Capital requirements trend
- Technology adoption costs

---

## Alert Triggers

### Consolidation Warnings

```typescript
const alerts = {
  // HIGH consolidation alert
  highConsolidation: {
    trigger: hhi > 2500 && gini > 0.6,
    message: 'Market highly concentrated - potential antitrust concern'
  },
  
  // ACCELERATING consolidation
  accelerating: {
    trigger: hhiChange > 200 && maActivity > avgMAActivity * 1.5,
    message: 'Consolidation accelerating - increased M&A activity'
  },
  
  // BARRIER to entry rising
  risingBarrier: {
    trigger: formationRate < 3 && closureRate > 10,
    message: 'Market barriers rising - new firm formation declining'
  },
  
  // PRICING power surge
  pricingPower: {
    trigger: premiumIndex > 150 && avgBidders < 3,
    message: 'Dominant firms exhibiting strong pricing power'
  }
};
```

---

## Summary

**The architecture market consolidation tracking system captures:**

### **7 Core Categories:**
1. M&A Events (acquisitions, mergers, deal values)
2. Market Share Shifts (concentration, CR4, distribution)
3. Pricing Power (premiums, competition, client lock-in)
4. Barriers to Entry (formation rate, survival, capital costs)
5. Network Centralization (client concentration, supplier exclusivity, influence)
6. Strategic Behavior (partnerships, expansion, cooperation)
7. Time-Series Metrics (HHI, Gini, CR4, survival curves)

### **20+ Specific Metrics Tracked:**
- Herfindahl-Hirschman Index (HHI)
- Gini Coefficient
- CR4 / CR8 concentration ratios
- Premium Index
- Average bidders per RFP
- Client switching rate
- New firm formation rate
- Survival rates by firm size
- Network centrality scores
- Supplier exclusivity rate
- M&A deal counts and values
- Employee impact from M&A
- And more...

### **Data Stored In:**
- `/marketIntelligence` - Primary consolidation metrics
- `/archHistory` - M&A event timeline
- `/networkGraph` - Network centralization metrics
- `/offices`, `/projects`, `/financials` - Raw data for computation

**All metrics computed periodically and stored for instant querying by AI orchestrator.**

---

*This system provides comprehensive, multi-dimensional tracking of architecture market consolidation using industry-standard economic metrics and custom architecture-specific indicators.*

