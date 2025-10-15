# Pulse - Automated Daily Intelligence Collection

## Overview

**The Pulse** is an automated system that performs daily rounds of the architecture market, collecting time-sensitive data that requires daily updates to maintain relevance. It acts as the "morning intelligence briefing" for the AI Orchestrator, gathering fresh market data every day before users start their work.

**Tagline:** *"The market's vital signs, checked every morning."*

---

## Why This Feature Exists

### The Problem
Architecture market intelligence becomes stale quickly. Key data points change daily:
- M&A announcements break overnight
- Interest rates shift affecting project feasibility
- Material prices fluctuate with commodity markets
- Global events disrupt supply chains
- News about projects, offices, and regulations emerges constantly

**Without daily updates:** Users get outdated intelligence, miss opportunities, make decisions on stale data.

### The Solution
The Pulse automatically wakes up every morning (configurable time, e.g., 6 AM local time) and performs a systematic "rounds" of the market, collecting all time-sensitive data points. By the time users log in, fresh intelligence is ready.

---

## What The Pulse Collects

### 1. 📰 **News Intelligence** (Highest Priority)
**Source Collections:**
- `/newsArticles` - New articles since yesterday

**What it does:**
- Scrapes architecture news sites (ArchDaily, Dezeen, Architectural Record)
- Monitors financial news (Bloomberg, FT, Reuters) for M&A
- Checks press releases from major architecture offices
- Monitors local news in tracked cities for project announcements
- Uses AI to extract structured data (offices mentioned, deal values, sentiment)
- Links articles to relevant entities (offices, projects, cities)

**Data captured:**
```typescript
{
  title: "Foster + Partners wins $500M airport terminal",
  publishedDate: "2024-10-14T08:30:00Z",
  category: "project-announcement",
  entities: {
    offices: ["GBLO127"],
    projects: ["singapore-terminal-5"],
    cities: ["singapore"]
  },
  extractedData: {
    projectBudget: 500000000,
    dealType: "won-competition"
  },
  sentiment: "positive",
  relevance: 9
}
```

### 2. 💰 **Interest Rates** (Market Critical)
**Source Collections:**
- `/externalMacroeconomic` → `interestRates`

**What it does:**
- Checks central bank APIs for rate changes
- Monitors: Bank of England, Federal Reserve, ECB, etc.
- Only updates if rates changed (most days: no change)
- Flags rate changes for immediate impact analysis

**Data captured:**
```typescript
{
  cityId: "london-uk",
  interestRates: {
    current: 5.25,
    previousRate: 5.25,
    changed: false,
    lastChange: "2024-09-20",
    trend: "holding-steady",
    nextMeetingDate: "2024-11-07",
    source: "Bank of England",
    lastUpdated: "2024-10-14T06:00:00Z"
  }
}
```

**If rate changes detected:**
- Triggers alert to AI
- Flags for immediate `externalForcesImpact` recomputation
- Notifies users of market-moving event

### 3. 🏗️ **Commodity Material Prices** (Cost Critical)
**Source Collections:**
- `/externalSupplyChain` → `materials[]`

**What it does:**
- Checks commodity exchanges for volatile materials
- London Metal Exchange for steel, aluminum, copper
- Energy markets for fuel/diesel
- Updates price indexes relative to baseline

**Data captured:**
```typescript
{
  materials: [
    {
      material: "steel",
      priceIndex: 147,      // Up from 145 yesterday
      priceChange: +1.4,    // +1.4% vs yesterday
      volatility: 8,
      source: "London Metal Exchange",
      lastUpdated: "2024-10-14T06:15:00Z"
    },
    {
      material: "aluminum",
      priceIndex: 132,
      priceChange: -0.8,
      // ...
    }
  ]
}
```

### 4. 🌍 **Global Events Monitoring** (Crisis Detection)
**Source Collections:**
- `/externalEvents` → `activeEvents[]`

**What it does:**
- Monitors news feeds for major events
- Detects: wars, pandemics, natural disasters, financial crises
- AI classifies severity and impact
- Analyst review queue for major events

**Data captured:**
```typescript
{
  activeEvents: [
    {
      eventId: "hurricane-milton-2024",
      eventType: "natural-disaster",
      status: "ongoing",
      severity: "severe",
      affectedCities: ["miami-usa", "tampa-usa"],
      impacts: {
        materialSupply: "Southeast US supply chain disrupted",
        constructionActivity: "All projects halted in evacuation zone"
      },
      detected: "2024-10-08T12:00:00Z",
      lastUpdated: "2024-10-14T06:30:00Z"
    }
  ]
}
```

### 5. 📊 **Exchange Rates** (Cost Impact)
**Source Collections:**
- `/externalMacroeconomic` → `exchangeRates`

**What it does:**
- Checks currency exchange APIs
- Updates rates for cities with foreign material imports
- Flags major currency movements (>2% change)

**Data captured:**
```typescript
{
  exchangeRates: {
    localCurrency: "GBP",
    rates: {
      "GBP/USD": 1.27,
      "GBP/EUR": 1.17
    },
    dayChange: {
      "GBP/USD": -0.3  // Down 0.3% - materials slightly more expensive
    },
    lastUpdated: "2024-10-14T06:00:00Z"
  }
}
```

---

## How The Pulse Works

### Architecture

```
┌─────────────────────────────────────────────────┐
│         THE PULSE ORCHESTRATOR            │
│                                                 │
│  Runs: Every day at 6:00 AM (configurable)     │
└─────────────────────────────────────────────────┘
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌──────────────┐          ┌──────────────┐
│  COLLECTORS  │          │   ANALYZERS  │
│  (Parallel)  │          │  (Sequential)│
└──────────────┘          └──────────────┘
        ↓                           ↓
        
COLLECTORS (Run in Parallel):
├─ News Scraper
│  ├─ ArchDaily API
│  ├─ Dezeen RSS
│  ├─ Financial Times API
│  ├─ Bloomberg Terminal Feed
│  └─ Office Press Release Monitors
│
├─ Interest Rate Monitor
│  ├─ Bank of England API
│  ├─ Federal Reserve API
│  ├─ ECB API
│  └─ Other Central Banks
│
├─ Commodity Price Monitor
│  ├─ London Metal Exchange
│  ├─ COMEX (Commodity Exchange)
│  ├─ Energy Markets
│  └─ Material Indexes
│
├─ Event Monitor
│  ├─ Reuters News Feed
│  ├─ AP News Feed
│  └─ Crisis Detection AI
│
└─ Exchange Rate Monitor
   └─ Currency Exchange APIs

        ↓ (Results collected)
        
ANALYZERS (Run after collection):
├─ AI Entity Extraction
│  └─ Parse news → identify offices, projects, people
│
├─ Sentiment Analysis
│  └─ Classify news sentiment
│
├─ Impact Assessment
│  └─ Flag high-impact changes (rate changes, major events)
│
├─ Linkage Builder
│  └─ Connect news to existing entities
│
└─ Alert Generator
   └─ Create alerts for users

        ↓
        
STORAGE:
├─ Write to Firestore collections
├─ Update timestamps
├─ Increment counters
└─ Log successful collection

        ↓
        
NOTIFICATIONS:
├─ Push to AI Orchestrator: "Fresh data available"
├─ User notifications: "5 new relevant articles"
└─ Admin dashboard: "Pulse completed"
```

---

## Technical Implementation

### Cloud Function Structure

```typescript
// /functions/src/pulse/index.ts

import { PubSub } from '@google-cloud/pubsub';
import { logger } from 'firebase-functions';

export const pulseOrchestrator = functions.pubsub
  .schedule('0 6 * * *')  // Every day at 6 AM
  .timeZone('UTC')
  .onRun(async (context) => {
    logger.info('🌅 Pulse starting...');
    
    const startTime = Date.now();
    const results = {
      news: 0,
      rates: 0,
      materials: 0,
      events: 0,
      exchanges: 0,
      errors: []
    };
    
    try {
      // Run collectors in parallel
      const [news, rates, materials, events, exchanges] = await Promise.allSettled([
        collectNews(),
        collectInterestRates(),
        collectMaterialPrices(),
        monitorGlobalEvents(),
        collectExchangeRates()
      ]);
      
      // Process results
      if (news.status === 'fulfilled') {
        results.news = news.value.articlesCollected;
        await processNewsArticles(news.value.articles);
      } else {
        results.errors.push({ collector: 'news', error: news.reason });
      }
      
      if (rates.status === 'fulfilled') {
        results.rates = rates.value.citiesUpdated;
        await processInterestRates(rates.value.updates);
      }
      
      // ... process other collectors
      
      // Run analysis phase
      await analyzeCollectedData(results);
      
      // Generate alerts
      const alerts = await generateAlerts(results);
      
      // Notify systems
      await notifyAIOrchestrator('pulse-complete', results);
      await notifyUsers(alerts);
      
      const duration = Date.now() - startTime;
      logger.info(`✅ Pulse completed in ${duration}ms`, results);
      
      // Log to monitoring collection
      await db.collection('systemLogs').add({
        type: 'pulse',
        timestamp: FieldValue.serverTimestamp(),
        duration,
        results,
        success: true
      });
      
    } catch (error) {
      logger.error('❌ Pulse failed', error);
      
      // Alert admin
      await notifyAdmin('Pulse Failure', error);
      
      throw error;
    }
  });
```

### Individual Collectors

#### News Collector

```typescript
// /functions/src/pulse/collectors/newsCollector.ts

interface NewsCollectionResult {
  articlesCollected: number;
  articles: ParsedArticle[];
}

export async function collectNews(): Promise<NewsCollectionResult> {
  const sources = [
    { name: 'ArchDaily', scraper: scrapeArchDaily },
    { name: 'Dezeen', scraper: scrapeDezeen },
    { name: 'Architectural Record', scraper: scrapeArchRecord },
    { name: 'Financial Times', scraper: scrapeFT },
    { name: 'Bloomberg', scraper: scrapeBloomberg }
  ];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const allArticles: ParsedArticle[] = [];
  
  // Scrape all sources in parallel
  const results = await Promise.allSettled(
    sources.map(source => source.scraper(yesterday))
  );
  
  for (const [index, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
      logger.info(`✅ ${sources[index].name}: ${result.value.length} articles`);
    } else {
      logger.warn(`⚠️ ${sources[index].name} failed:`, result.reason);
    }
  }
  
  // Deduplicate by URL
  const uniqueArticles = deduplicateArticles(allArticles);
  
  // AI processing
  const processedArticles = await Promise.all(
    uniqueArticles.map(article => enrichArticleWithAI(article))
  );
  
  return {
    articlesCollected: processedArticles.length,
    articles: processedArticles
  };
}

async function enrichArticleWithAI(article: ParsedArticle): Promise<ParsedArticle> {
  // Call Claude API to extract entities and sentiment
  const prompt = `
    Analyze this architecture news article and extract:
    1. Office names mentioned (map to our database)
    2. Project names and details
    3. Deal values or budgets
    4. Cities mentioned
    5. Overall sentiment (positive/neutral/negative)
    6. Relevance to architecture market (1-10)
    7. Category (M&A, project-announcement, award, scandal, etc.)
    
    Article:
    Title: ${article.title}
    Content: ${article.content}
  `;
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: prompt
    }]
  });
  
  const extracted = JSON.parse(response.content[0].text);
  
  return {
    ...article,
    entities: extracted.entities,
    sentiment: extracted.sentiment,
    relevance: extracted.relevance,
    category: extracted.category,
    extractedData: extracted.dealData
  };
}
```

#### Interest Rate Monitor

```typescript
// /functions/src/pulse/collectors/ratesCollector.ts

interface RateUpdate {
  cityId: string;
  previousRate: number;
  currentRate: number;
  changed: boolean;
}

export async function collectInterestRates(): Promise<{
  citiesUpdated: number;
  updates: RateUpdate[];
}> {
  const centralBanks = [
    { region: 'UK', cities: ['london-uk'], api: checkBankOfEngland },
    { region: 'US', cities: ['new-york-usa', 'san-francisco-usa'], api: checkFederalReserve },
    { region: 'EU', cities: ['paris-fr', 'berlin-de'], api: checkECB },
    { region: 'UAE', cities: ['dubai-uae'], api: checkUAECentralBank }
  ];
  
  const updates: RateUpdate[] = [];
  
  for (const bank of centralBanks) {
    const currentRate = await bank.api();
    
    for (const cityId of bank.cities) {
      // Get previous rate from Firestore
      const doc = await db.collection('externalMacroeconomic')
        .doc(`${cityId}-current`)
        .get();
      
      const previousRate = doc.data()?.interestRates?.current || 0;
      const changed = currentRate !== previousRate;
      
      if (changed) {
        logger.warn(`🚨 RATE CHANGE: ${bank.region} ${previousRate}% → ${currentRate}%`);
      }
      
      updates.push({
        cityId,
        previousRate,
        currentRate,
        changed
      });
    }
  }
  
  return {
    citiesUpdated: updates.length,
    updates
  };
}

async function checkBankOfEngland(): Promise<number> {
  // Call Bank of England API
  const response = await fetch('https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp');
  const data = await response.json();
  return data.currentRate;
}
```

#### Commodity Price Monitor

```typescript
// /functions/src/pulse/collectors/commodityCollector.ts

export async function collectMaterialPrices(): Promise<{
  materialsUpdated: number;
  alerts: string[];
}> {
  const materials = [
    { name: 'steel', source: 'LME', api: checkLMESteel },
    { name: 'aluminum', source: 'LME', api: checkLMEAluminum },
    { name: 'copper', source: 'COMEX', api: checkCOMEXCopper },
    { name: 'diesel', source: 'Energy', api: checkDieselPrice }
  ];
  
  const alerts: string[] = [];
  const baseline = 100; // Historical baseline
  
  for (const material of materials) {
    const currentPrice = await material.api();
    
    // Get yesterday's price
    const yesterday = await getPreviousPrice(material.name);
    
    const priceIndex = (currentPrice / getBaselinePrice(material.name)) * 100;
    const dayChange = ((currentPrice - yesterday) / yesterday) * 100;
    
    // Alert if >5% daily change
    if (Math.abs(dayChange) > 5) {
      alerts.push(`${material.name} ${dayChange > 0 ? 'up' : 'down'} ${Math.abs(dayChange).toFixed(1)}%`);
    }
    
    // Update Firestore
    await updateMaterialPrice(material.name, {
      priceIndex,
      priceChange: dayChange,
      lastUpdated: FieldValue.serverTimestamp()
    });
  }
  
  return {
    materialsUpdated: materials.length,
    alerts
  };
}
```

---

## User Experience

### Pulse Dashboard

When users log in, they see:

```
┌─────────────────────────────────────────────────┐
│  🌅 PULSE - Monday, October 14, 2024     │
│  Last updated: 6:23 AM                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  📰 NEWS INTELLIGENCE                           │
│  ├─ 47 new articles collected                   │
│  ├─ 5 relevant to your tracked offices          │
│  └─ 2 high-priority alerts                      │
│     • Foster + Partners wins $500M airport      │
│     • Zaha Hadid retrospective opens in Tokyo   │
│                                                 │
│  💰 INTEREST RATES                              │
│  ├─ No changes - all rates holding steady       │
│  └─ Next Fed meeting: Nov 7                     │
│                                                 │
│  🏗️ MATERIAL MARKETS                            │
│  ├─ Steel: ↑ +1.4% (now 147 index)             │
│  ├─ Aluminum: ↓ -0.8% (now 132 index)          │
│  └─ ⚠️ Alert: Steel up 8% this week             │
│                                                 │
│  🌍 GLOBAL EVENTS                               │
│  ├─ No new major events                         │
│  └─ Monitoring: Ukraine situation ongoing       │
│                                                 │
│  [View Full Report] [Configure Alerts]          │
└─────────────────────────────────────────────────┘
```

### AI Chat Integration

```
User: "What's new in the market today?"

AI: "Based on this morning's Pulse at 6:23 AM:

📰 NEWS HIGHLIGHTS:
• Foster + Partners won a $500M airport terminal competition in Singapore - 
  major win in the Asia-Pacific market
• Steel prices are up 1.4% today and 8% this week - affecting project costs
• No interest rate changes, but Fed meeting coming Nov 7

🎯 RELEVANT TO YOU:
You're tracking Foster + Partners - this Singapore win is their 3rd major 
airport project this year, strengthening their position in transport infrastructure.

Would you like me to analyze the competitive implications of this win?"
```

### Push Notifications (Optional)

Users can configure alerts:

```typescript
{
  userId: "user-123",
  pulseAlerts: {
    enabled: true,
    preferences: {
      newsAboutTrackedOffices: true,
      interestRateChanges: true,
      materialPriceSpikes: true,  // >5% change
      majorEvents: true,
      deliveryTime: "7:00 AM",
      deliveryMethod: "push-notification"
    }
  }
}
```

---

## Data Flow

### Pulse → Firestore

```typescript
// Updated collections after Pulse runs:

/newsArticles
  /[articleId]  ← NEW documents created

/externalMacroeconomic
  /[cityId]-current
    interestRates.lastUpdated ← Updated timestamp
    interestRates.current ← Potentially changed
    
/externalSupplyChain
  /[cityId]-current
    materials[].priceIndex ← Updated
    materials[].lastUpdated ← Updated timestamp
    
/externalEvents
  /global-current
    activeEvents[] ← New events added or updated
    
/systemLogs
  /pulse-2024-10-14  ← Log entry created
    timestamp
    results
    duration
```

### Trigger Downstream Updates

```typescript
// If major changes detected:

IF (interest rate changed) {
  → Trigger externalForcesImpact recomputation
  → Flag affected projects for review
  → Send admin alert
}

IF (material price spike > 5%) {
  → Update supply chain analysis
  → Flag projects using that material
  → Alert cost estimators
}

IF (major event detected - severity: severe) {
  → Trigger immediate analyst review
  → Update affected city risk levels
  → Alert users in affected regions
}
```

---

## Configuration

### Admin Settings

```typescript
// /admin/settings/pulse

{
  enabled: true,
  schedule: {
    time: "06:00",
    timezone: "UTC",
    runOnWeekends: true
  },
  
  collectors: {
    news: {
      enabled: true,
      sources: ["archDaily", "dezeen", "archRecord", "bloomberg", "ft"],
      lookbackDays: 1,
      maxArticlesPerSource: 50
    },
    interestRates: {
      enabled: true,
      centralBanks: ["BOE", "FED", "ECB", "UAECB"]
    },
    commodityPrices: {
      enabled: true,
      materials: ["steel", "aluminum", "copper", "diesel"],
      alertThreshold: 5  // % daily change
    },
    globalEvents: {
      enabled: true,
      severityThreshold: "moderate",  // Only track moderate+ events
      requireAnalystReview: true
    },
    exchangeRates: {
      enabled: true,
      currencies: ["USD", "EUR", "GBP", "AED", "CNY"]
    }
  },
  
  ai: {
    model: "claude-sonnet-4-20250514",
    entityExtraction: true,
    sentimentAnalysis: true,
    maxTokensPerArticle: 1024
  },
  
  notifications: {
    adminAlerts: true,
    userNotifications: true,
    slackWebhook: "https://hooks.slack.com/...",
    emailRecipients: ["admin@company.com"]
  },
  
  performance: {
    timeout: 600,  // 10 minutes max
    retries: 3,
    parallelCollectors: true
  }
}
```

---

## Monitoring & Reliability

### Success Metrics

Track in admin dashboard:

```typescript
{
  date: "2024-10-14",
  metrics: {
    executionTime: 234,  // seconds
    articlesCollected: 47,
    ratesChecked: 12,
    materialsUpdated: 8,
    eventsMonitored: "all",
    errors: 0,
    successRate: 100,
    dataFreshness: "6 hours 23 minutes ago"
  }
}
```

### Health Checks

```typescript
// Check if Pulse is working
async function checkPulseHealth(): Promise<HealthStatus> {
  const latestRun = await db.collection('systemLogs')
    .where('type', '==', 'pulse')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();
  
  if (latestRun.empty) {
    return { status: 'error', message: 'No runs found' };
  }
  
  const lastRun = latestRun.docs[0].data();
  const hoursSinceRun = (Date.now() - lastRun.timestamp.toMillis()) / (1000 * 60 * 60);
  
  if (hoursSinceRun > 26) {  // Should run every 24 hours
    return { 
      status: 'error', 
      message: `Last run was ${hoursSinceRun.toFixed(1)} hours ago` 
    };
  }
  
  if (!lastRun.success) {
    return { 
      status: 'warning', 
      message: `Last run failed: ${lastRun.error}` 
    };
  }
  
  return { 
    status: 'healthy', 
    message: `Last successful run: ${hoursSinceRun.toFixed(1)} hours ago`,
    metrics: lastRun.results
  };
}
```

### Error Recovery

```typescript
// Retry failed collectors
if (collector.failed) {
  logger.warn(`Retrying ${collector.name}...`);
  
  await sleep(5000);  // Wait 5 seconds
  
  try {
    const result = await collector.retry();
    logger.info(`✅ ${collector.name} succeeded on retry`);
  } catch (error) {
    logger.error(`❌ ${collector.name} failed again`);
    
    // Still continue with other collectors
    // Admin will get notification
  }
}
```

---

## Implementation Phases

### Phase 1: Core Collectors (Week 1-2)
- ✅ Set up Cloud Function infrastructure
- ✅ Build news scraper (ArchDaily, Dezeen)
- ✅ Build interest rate monitor (BOE, Fed)
- ✅ Build basic logging

### Phase 2: AI Processing (Week 3)
- ✅ Integrate Claude API for entity extraction
- ✅ Build sentiment analysis
- ✅ Connect to Firestore entities (offices, projects)

### Phase 3: Additional Collectors (Week 4)
- ✅ Add commodity price monitoring
- ✅ Add exchange rate monitoring
- ✅ Add global events monitoring

### Phase 4: User Experience (Week 5)
- ✅ Build Pulse dashboard
- ✅ Integrate with AI chat
- ✅ Add user notification preferences

### Phase 5: Monitoring & Reliability (Week 6)
- ✅ Add health checks
- ✅ Build admin monitoring dashboard
- ✅ Set up alerts for failures
- ✅ Performance optimization

---

## Cost Estimates

### Daily Operating Costs

```
CLOUD FUNCTIONS:
- 1 invocation/day × 30 days = 30 invocations/month
- Avg 5 min execution time = 150 minutes compute/month
- Cost: ~$0.50/month

API CALLS:
- Claude API: ~50 articles × $0.015/article = $0.75/day = $22.50/month
- News APIs: $50-200/month (depending on sources)
- Financial APIs: Free (central banks) to $100/month
- Total API: ~$150-350/month

FIRESTORE:
- Writes: ~60 documents/day = 1,800/month
- Cost: ~$1/month

TOTAL: ~$175-400/month for complete Pulse
```

### Optimization Options

If costs too high:
- Reduce news sources
- Process only high-priority articles with AI
- Use cheaper AI model for initial filtering
- Cache commodity prices (update less frequently)

---

## Success Criteria

### The Pulse is successful if:

✅ **Reliability:** 99%+ uptime, runs every day on schedule  
✅ **Speed:** Completes in < 10 minutes  
✅ **Coverage:** Captures 80%+ of major architecture news  
✅ **Accuracy:** AI entity extraction 90%+ accurate  
✅ **Freshness:** All data < 24 hours old  
✅ **User Value:** Users cite Pulse data in decisions  

---

## Future Enhancements

### V2 Features:
- **Real-time mode** - Monitor critical feeds continuously (not just 6 AM)
- **Predictive alerts** - AI predicts rate changes before they happen
- **Custom feeds** - Users configure exactly what they track
- **Social media monitoring** - Twitter, LinkedIn for office announcements
- **Image analysis** - Extract data from project photos, renderings

### V3 Features:
- **Multi-timezone support** - Different pulse times per region
- **Competitive intelligence** - Track competitor activities specifically
- **Tender monitoring** - Scrape public tender databases
- **Patent tracking** - Monitor architecture/construction patents

---

## Conclusion

**The Pulse** transforms the AI Orchestrator from a static database into a living, breathing market intelligence system. Every morning, fresh data flows in automatically, ensuring users always work with current information.

**Key Value:**
- ⏰ **Time savings:** No manual checking of news sites, rates, prices
- 🎯 **Completeness:** Systematic coverage of all critical data points
- 🚀 **Speed:** Users get briefed before their coffee is finished
- 🧠 **Intelligence:** AI processing turns raw data into insights
- 📊 **Reliability:** Automated = consistent, no human forgetting

**Tagline:** *"Wake up to a fresh market intelligence briefing, every single day."*

---

**Status:** Ready for implementation  
**Priority:** High (core infrastructure for market intelligence)  
**Dependencies:** Firestore database, Claude API, Cloud Functions  
**Estimated Implementation:** 6 weeks  

