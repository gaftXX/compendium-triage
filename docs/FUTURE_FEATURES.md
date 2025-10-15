# Future Features - Dormant Functionality

This document outlines all features, collections, operations, and UI components that are **NOT included in the initial build** but are planned for future expansion.

## Major Future Systems

Two comprehensive systems are fully designed and documented, ready for implementation after the MVP:

1. **Market Consolidator** - Comprehensive market intelligence system tracking consolidation patterns, competitive dynamics, and strategic positioning. Includes 7 core categories, 20+ metrics (HHI, Gini, CR4/CR8), M&A tracking, network analysis, and pricing power indicators.

2. **Pulse** - Automated daily intelligence collection system that runs every morning to gather fresh market data (news, interest rates, commodity prices, global events, exchange rates) and provide AI-powered briefings to users.

---

## Database Collections - Dormant (28 of 31)

### Tier 1: Primary Entities (1 Dormant)
- `/cities` - Geographic market data, consolidation metrics

### Tier 2: Connective Tissue (3 Dormant)
- `/relationships` - Graph edges connecting entities (structure exists, minimal use initially)
- `/archHistory` - Timeline events, M&A tracking, company evolution
- `/networkGraph` - Precomputed connection metrics, network analysis

### Tier 3: Detailed Data (17 of 20 Dormant)

**Enrichment Data (10 Dormant):**
- `/clients` - Client entities, relationships, contracts
- `/workforce` - Talent pool, employees, skills, credentials
- `/technology` - Technology adoption, innovation tracking, digital tools
- `/financials` - Financial transactions, revenue, costs, profitability
- `/supplyChain` - Suppliers, materials, logistics, procurement
- `/landData` - Land parcels, development sites, real estate
- `/cityData` - Detailed city demographics, cultural context, market characteristics
- `/projectData` - Comprehensive project execution data (vision, team composition, performance metrics, legacy impact)
- `/companyStructure` - Organizational charts, hierarchies, divisions
- `/divisionPercentages` - Analytics breakdowns, revenue splits, practice area distribution
- `/newsArticles` - News & media coverage, press releases, public perception

**External Forces Data (7 Dormant - All):**
- `/externalMacroeconomic` - GDP trends, interest rates, inflation, economic cycles
- `/externalTechnology` - Disruptive tech, AI/ML adoption, digital transformation trends
- `/externalSupplyChain` - Material costs, availability, logistics disruptions, trade flows
- `/externalDemographics` - Population shifts, urbanization patterns, migration trends
- `/externalClimate` - Climate risks, sustainability regulations, green building mandates
- `/externalPolicy` - Tax policy, trade regulations, government incentives, subsidies
- `/externalEvents` - Wars, pandemics, natural disasters, political upheaval

**Political Context (1 Dormant):**
- `/politicalContext` - Governance structures, institutions, political stability, regulatory environment

### Tier 4: Market Intelligence (5 Dormant - All)
- `/marketIntelligence` - HHI (Herfindahl-Hirschman Index), Gini coefficients, consolidation metrics
- `/trends` - Industry trend tracking, pattern recognition, forecasting
- `/competitiveAnalysis` - SWOT analysis, competitive positioning, market share
- `/financialMetrics` - Computed KPIs, performance benchmarks, financial ratios
- `/externalForcesImpact` - Impact analysis, scenario modeling, sensitivity analysis

---

## Database Operations - Future

### Client Operations
- CREATE_CLIENT, UPDATE_CLIENT, DELETE_CLIENT
- SEARCH_CLIENTS, GET_CLIENT
- LINK_CLIENT_TO_OFFICE, LINK_CLIENT_TO_PROJECT
- Track client relationships and contract history

### Workforce Operations
- CREATE_WORKFORCE_RECORD, UPDATE_WORKFORCE_RECORD
- SEARCH_WORKFORCE, GET_WORKFORCE
- Track talent pool, skills, credentials
- Employee movement between firms
- Leadership changes and succession

### Financial Operations
- CREATE_FINANCIAL_RECORD, UPDATE_FINANCIAL_RECORD
- SEARCH_FINANCIALS, GET_FINANCIALS
- Revenue tracking, cost analysis
- Profitability calculations
- Financial health metrics

### Supply Chain Operations
- CREATE_SUPPLIER, UPDATE_SUPPLIER
- SEARCH_SUPPLY_CHAIN, GET_SUPPLY_CHAIN
- Track material costs, availability
- Monitor logistics disruptions
- Supplier relationship management

### Land & City Data Operations
- CREATE_LAND_PARCEL, UPDATE_LAND_PARCEL
- CREATE_CITY_DATA, UPDATE_CITY_DATA
- SEARCH_LAND_DATA, SEARCH_CITY_DATA
- Real estate tracking
- Development site monitoring
- Urban context analysis

### Political Context Operations
- CREATE_POLITICAL_RECORD, UPDATE_POLITICAL_RECORD
- SEARCH_POLITICAL_CONTEXT, GET_POLITICAL_CONTEXT
- Track governance structures
- Monitor institutional changes
- Political stability analysis

### External Forces Operations (All 7 Categories)
- CREATE_EXTERNAL_FORCE, UPDATE_EXTERNAL_FORCE
- SEARCH_EXTERNAL_FORCES, GET_EXTERNAL_FORCE
- Macroeconomic monitoring
- Technology disruption tracking
- Supply chain global analysis
- Demographic trend analysis
- Climate impact assessment
- Policy change tracking
- Event impact analysis

### Market Intelligence Operations
- CALCULATE_HHI (Herfindahl-Hirschman Index)
- CALCULATE_GINI (Gini coefficient)
- ANALYZE_MARKET_CONSOLIDATION
- DETECT_TRENDS
- GENERATE_COMPETITIVE_ANALYSIS
- COMPUTE_FINANCIAL_METRICS
- MODEL_EXTERNAL_FORCES_IMPACT
- Network graph computation
- Connection strength algorithms

### ArchHistory Operations
- CREATE_HISTORY_EVENT, UPDATE_HISTORY_EVENT
- TRACK_MA_ACTIVITY (mergers & acquisitions)
- TIMELINE_VISUALIZATION
- Company evolution tracking
- Historical analysis queries

### Network Graph Operations
- COMPUTE_NETWORK_GRAPH
- ANALYZE_CONNECTIONS
- FIND_SHORTEST_PATH
- IDENTIFY_CLUSTERS
- MEASURE_CENTRALITY
- Graph traversal algorithms

---

## UI Components - Future

### Client Relationship Interfaces
- Client list view with filtering
- Client detail cards with contract history
- Client-office relationship visualizer
- Client project portfolio view
- Client interaction timeline

### Financial Dashboards
- Revenue tracking charts
- Cost analysis breakdowns
- Profitability metrics displays
- Financial health indicators
- Animated financial graphs
- Year-over-year comparisons
- Financial forecast visualizations

### City & Land Data Visualizations
- Interactive maps of development sites
- City demographic overlays
- Land parcel detail views
- Urban context visualizations
- Real estate market trends
- Geographic heat maps

### Workforce & Talent Management
- Talent pool browser
- Skills matrix displays
- Employee movement tracking
- Leadership succession planning
- Credential verification views
- Hiring trend analysis

### Division Analytics
- Division percentage calculators
- Practice area breakdowns
- Revenue split visualizations
- Animated pie charts
- Practice area trend graphs

### External Forces Monitoring Dashboards (7 Categories)
- **Macroeconomic Dashboard:** GDP trends, interest rate graphs, inflation indicators
- **Technology Dashboard:** Disruptive tech tracking, AI adoption metrics, digital transformation progress
- **Supply Chain Dashboard:** Material cost trends, availability alerts, logistics disruption maps
- **Demographics Dashboard:** Population shift visualizations, urbanization patterns, migration flows
- **Climate Dashboard:** Climate risk heat maps, sustainability compliance, green building trends
- **Policy Dashboard:** Tax policy changes, trade regulation tracking, incentive programs
- **Events Dashboard:** War impact analysis, pandemic tracking, disaster response, political upheaval alerts

### Political Context Interfaces
- Governance structure displays
- Institutional stability indicators
- Regulatory environment tracking
- Political risk assessments

### News & Media Tracking
- News article aggregation
- Press release feeds
- Public perception analysis
- Media sentiment tracking
- Source credibility scoring

### Company Structure Visualizers
- Organizational chart displays
- Hierarchy browsers
- Division structure views
- Interactive org charts
- Leadership structure maps

### Market Intelligence Dashboards
- HHI calculation displays
- Gini coefficient graphs
- Market consolidation trends
- Competitive landscape visualizations
- Market share pie charts

### Trend Analysis Interfaces
- Trend detection displays
- Pattern recognition visualizations
- Forecasting graphs
- Trend comparison tools
- Industry movement tracking

### Competitive Analysis Tools
- SWOT matrix displays
- Competitive positioning maps
- Market share comparisons
- Competitor tracking dashboards
- Strategic positioning charts

### Network Graph Visualizations
- Interactive network diagrams
- Connection strength visualizers
- Cluster identification displays
- Centrality heat maps
- Graph traversal animations

### M&A Timeline Views
- Merger & acquisition timelines
- Deal tracking interfaces
- Company evolution visualizations
- Historical event browsers
- Acquisition impact analysis

---

## AI Orchestrator Actions - Future

### Client Actions
- CREATE_CLIENT
- UPDATE_CLIENT
- DELETE_CLIENT
- SEARCH_CLIENTS
- GET_CLIENT
- LINK_CLIENT_TO_OFFICE
- LINK_CLIENT_TO_PROJECT
- ANALYZE_CLIENT_RELATIONSHIPS

### Financial Actions
- CREATE_FINANCIAL_RECORD
- UPDATE_FINANCIAL_RECORD
- DELETE_FINANCIAL_RECORD
- SEARCH_FINANCIALS
- GET_FINANCIALS
- CALCULATE_PROFITABILITY
- ANALYZE_FINANCIAL_HEALTH

### Workforce Actions
- CREATE_WORKFORCE_RECORD
- UPDATE_WORKFORCE_RECORD
- DELETE_WORKFORCE_RECORD
- SEARCH_WORKFORCE
- GET_WORKFORCE
- TRACK_TALENT_MOVEMENT
- ANALYZE_SKILLS_GAP

### Supply Chain Actions
- CREATE_SUPPLIER
- UPDATE_SUPPLIER
- DELETE_SUPPLIER
- SEARCH_SUPPLY_CHAIN
- GET_SUPPLY_CHAIN
- MONITOR_DISRUPTIONS
- ANALYZE_MATERIAL_COSTS

### Land & City Data Actions
- CREATE_LAND_PARCEL
- UPDATE_LAND_PARCEL
- DELETE_LAND_PARCEL
- SEARCH_LAND_DATA
- GET_LAND_DATA
- CREATE_CITY_DATA
- UPDATE_CITY_DATA
- ANALYZE_URBAN_CONTEXT

### Political Context Actions
- CREATE_POLITICAL_RECORD
- UPDATE_POLITICAL_RECORD
- DELETE_POLITICAL_RECORD
- SEARCH_POLITICAL_CONTEXT
- GET_POLITICAL_CONTEXT
- ASSESS_POLITICAL_RISK
- MONITOR_GOVERNANCE_CHANGES

### External Forces Actions (7 Categories)
- CREATE_EXTERNAL_MACROECONOMIC
- CREATE_EXTERNAL_TECHNOLOGY
- CREATE_EXTERNAL_SUPPLY_CHAIN
- CREATE_EXTERNAL_DEMOGRAPHICS
- CREATE_EXTERNAL_CLIMATE
- CREATE_EXTERNAL_POLICY
- CREATE_EXTERNAL_EVENTS
- UPDATE_EXTERNAL_FORCE (all types)
- SEARCH_EXTERNAL_FORCES
- ANALYZE_EXTERNAL_IMPACT

### Market Intelligence Actions
- CALCULATE_HHI
- CALCULATE_GINI
- ANALYZE_CONSOLIDATION
- DETECT_TRENDS
- GENERATE_SWOT
- COMPUTE_FINANCIAL_METRICS
- MODEL_SCENARIOS
- FORECAST_TRENDS

### Network Graph Actions
- COMPUTE_GRAPH
- ANALYZE_CONNECTIONS
- FIND_PATH
- IDENTIFY_CLUSTERS
- MEASURE_CENTRALITY
- VISUALIZE_NETWORK

### ArchHistory Actions
- CREATE_HISTORY_EVENT
- UPDATE_HISTORY_EVENT
- DELETE_HISTORY_EVENT
- TRACK_MA
- ANALYZE_EVOLUTION
- GENERATE_TIMELINE

### Analytics Actions
- CALCULATE_DIVISION_PERCENTAGES
- ANALYZE_PRACTICE_AREAS
- COMPUTE_METRICS
- GENERATE_REPORTS
- BENCHMARK_PERFORMANCE

---

## Action Handlers - Future Files

### Handler Files Not Built Initially
- `clientActions.ts` - Client relationship operations
- `financialActions.ts` - Financial data operations
- `workforceActions.ts` - Talent and employee operations
- `supplyChainActions.ts` - Supplier and logistics operations
- `landDataActions.ts` - Land and real estate operations
- `cityDataActions.ts` - City demographics operations
- `politicalContextActions.ts` - Governance operations
- `externalForcesActions.ts` - All 7 external force types
- `marketIntelligenceActions.ts` - HHI, Gini, consolidation
- `trendActions.ts` - Trend detection and forecasting
- `competitiveAnalysisActions.ts` - SWOT and positioning
- `networkGraphActions.ts` - Graph computation
- `archHistoryActions.ts` - M&A and timeline tracking
- `analyticsActions.ts` - Division percentages and metrics
- `newsArticlesActions.ts` - News tracking and sentiment

---

## Advanced Features - Future

### Market Consolidator - Market Intelligence & Consolidation Tracking

**The Market Consolidator** is a comprehensive system for tracking and analyzing market consolidation patterns, competitive dynamics, and strategic positioning in the architecture industry.

**7 Core Categories of Data Tracking:**

1. **📊 Merger & Acquisition Events**
   - Acquisition timeline tracking
   - Deal value tracking and trends
   - Employee impact metrics
   - Post-merger integration monitoring
   - Consolidation event classification

2. **📈 Market Share Shifts**
   - HHI (Herfindahl-Hirschman Index) calculation
   - Gini coefficient for market inequality
   - CR4/CR8 concentration ratios (top 4/8 firms)
   - Market share distribution over time
   - Dominant player identification

3. **💵 Pricing Power Indicators**
   - Premium Index tracking
   - Average bidders per RFP
   - Client switching rates
   - Fee trends by market segment
   - Pricing power evolution

4. **🚧 Barriers to Entry Signals**
   - New firm formation rate
   - Survival curves by firm size
   - Capital requirements trends
   - Technology adoption costs
   - Regulatory compliance complexity

5. **🌐 Network Centralization**
   - Degree centrality (connection counts)
   - Betweenness centrality (bridging positions)
   - Closeness centrality (reach efficiency)
   - Client concentration metrics
   - Supplier exclusivity tracking
   - Influence scores

6. **🎯 Strategic Behavior Patterns**
   - Vertical integration tracking
   - Geographic expansion patterns
   - Practice area diversification
   - Strategic partnership monitoring
   - Competitive positioning shifts

7. **📉 Time-Series Mathematical Metrics**
   - Trend detection algorithms
   - Growth rate calculations
   - Volatility measurements
   - Forecasting models
   - Pattern recognition

**20+ Specific Metrics Tracked:**
- Herfindahl-Hirschman Index (HHI)
- Gini Coefficient
- CR4 / CR8 concentration ratios
- Premium Index
- Average bidders per RFP
- Client switching rate
- New firm formation rate
- Survival rates by firm size
- Network centrality scores (degree, betweenness, closeness)
- Client concentration ratio
- Supplier exclusivity index
- Revenue growth rates
- Market share evolution
- Geographic concentration
- Practice area diversity
- And more...

**Firestore Collections Used:**

*Primary Collection:*
- `/marketIntelligence` - Consolidation metrics, HHI, Gini, CR4, market share data

*Supporting Collections:*
- `/archHistory` - M&A event timeline with consolidation events
- `/networkGraph` - Network centralization metrics and influence scores
- `/trends` - Industry trend tracking
- `/competitiveAnalysis` - SWOT and competitive positioning
- `/financialMetrics` - Computed KPIs and performance metrics

*Data Sources:*
- `/offices` - Architecture offices (revenue, employees, market data)
- `/projects` - Architecture projects (for market share calculations)
- `/financials` - Financial records for computation
- `/relationships` - Graph edges for network analysis
- `/clients` - Client concentration data
- `/supplyChain` - Supplier exclusivity tracking

**How Market Consolidator Works:**

1. **Data Aggregation Pipeline:**
   - Continuously aggregates data from offices, projects, financials
   - Calculates market shares by geography, practice area, segment
   - Tracks changes over time

2. **Metric Computation:**
   - Runs scheduled calculations for HHI, Gini, CR4/CR8
   - Updates network centrality scores
   - Recalculates pricing power indicators
   - Computes barrier to entry metrics

3. **Trend Detection:**
   - AI analyzes time-series data for patterns
   - Identifies consolidation trends
   - Flags significant market shifts
   - Predicts future trajectories

4. **Alert System:**
   - Triggers alerts for major M&A events
   - Flags significant HHI changes (concentration warnings)
   - Alerts on pricing power shifts
   - Notifies about new market entrants or exits

5. **Visualization:**
   - Consolidation dashboard with key metrics
   - M&A activity timeline
   - Market share pie charts and trend lines
   - Network centralization graphs
   - Competitive positioning maps

**User Experience:**

*Consolidation Dashboard:*
```
┌─────────────────────────────────────────────────┐
│  📊 MARKET CONSOLIDATION OVERVIEW               │
│  London Architecture Market                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  HHI: 1,847 (Moderate Concentration) ↑ +124    │
│  Gini: 0.67 (High Inequality) ↑ +0.03         │
│  CR4: 52% (Top 4 firms) ↑ +4%                  │
│                                                 │
│  🚨 ALERT: Market concentration increasing       │
│            Foster+Partners acquired 3 firms     │
│            this quarter                         │
│                                                 │
│  RECENT M&A ACTIVITY:                           │
│  • Oct 8: Foster+Partners → Studio XYZ         │
│  • Sep 12: Zaha Hadid → Parametric Design Ltd  │
│                                                 │
│  PRICING POWER: Rising (+12% premium index)     │
│  NEW ENTRANTS: 2 (down from 5 last quarter)    │
│                                                 │
│  [View Detailed Analysis] [Export Report]       │
└─────────────────────────────────────────────────┘
```

*AI Chat Integration:*
```
User: "How consolidated is the London market?"

AI: "The London architecture market is moderately consolidated:

📊 KEY METRICS:
• HHI: 1,847 (moderate concentration, up from 1,723 last quarter)
• Top 4 firms control 52% market share (up 4%)
• Gini coefficient: 0.67 (high inequality)

⚠️ CONSOLIDATION TREND:
The market is consolidating rapidly. Foster+Partners has acquired 3 
firms this quarter, increasing their market share from 18% to 23%.

💵 PRICING IMPACT:
Premium index up 12% - top firms are gaining pricing power as 
competition decreases.

🚧 BARRIERS RISING:
New firm formation down 60% - barriers to entry increasing as 
incumbents strengthen positions.

Would you like me to analyze the competitive implications for 
specific firms?"
```

**Implementation Roadmap:**

*Phase 1: Core Metrics*
- Create `/marketIntelligence` Firestore collection
- Implement HHI calculation function
- Implement Gini coefficient calculation
- Implement CR4/CR8 concentration ratios
- Build data aggregation pipeline from offices/projects/financials

*Phase 2: M&A Tracking*
- Extend `/archHistory` with consolidationEvent structure
- Create M&A event entry UI
- Build acquisition timeline tracking
- Implement deal value tracking
- Add employee impact metrics

*Phase 3: Network Analysis*
- Create `/networkGraph` collection
- Implement centrality calculations (degree, betweenness, closeness)
- Build client concentration metrics
- Track supplier exclusivity
- Calculate influence scores

*Phase 4: Pricing & Competition*
- Implement premium index calculations
- Track average bidders per RFP
- Monitor client switching rates
- Build pricing power indicators

*Phase 5: Barriers & Entry Metrics*
- Track new firm formation rate
- Calculate survival curves by firm size
- Monitor capital requirements trends
- Measure technology adoption costs

*Phase 6: Dashboard & Visualization*
- Build consolidation overview dashboard
- Create M&A activity timeline view
- Add pricing power charts
- Implement network centralization graphs
- Design alert/warning system UI

*Phase 7: AI Integration*
- Register consolidation query actions
- Add trend detection capabilities
- Enable conversational market analysis
- Implement automated report generation

**Dependencies:**
- Dormant collections activated: marketIntelligence, archHistory, networkGraph, trends, competitiveAnalysis, financialMetrics
- Data sources available: offices (with revenue/employee data), projects, financials, relationships, clients, supplyChain
- AI orchestrator for trend analysis and conversational queries

**Status:** Fully designed and documented (961 lines of specification), but completely dormant. Implementation planned for future phase after core office/project/regulatory system is operational.

---

### Pulse - Automated Daily Intelligence Collection

**The Pulse** is an automated system that runs every morning (configurable time, e.g., 6 AM) to collect time-sensitive market data and provide fresh intelligence briefings.

**What Pulse Collects:**

1. **📰 News Intelligence (Highest Priority)**
   - Scrapes architecture news sites (ArchDaily, Dezeen, Architectural Record)
   - Monitors financial news (Bloomberg, FT, Reuters) for M&A announcements
   - Checks press releases from major architecture offices
   - Monitors local news in tracked cities for project announcements
   - AI extracts structured data (offices mentioned, deal values, sentiment)
   - Links articles automatically to relevant entities (offices, projects, cities)

2. **💰 Interest Rates (Market Critical)**
   - Checks central bank APIs (Bank of England, Federal Reserve, ECB, etc.)
   - Only updates if rates changed
   - Flags rate changes for immediate impact analysis
   - Tracks next meeting dates

3. **🏗️ Commodity Material Prices (Cost Critical)**
   - London Metal Exchange for steel, aluminum, copper
   - Energy markets for fuel/diesel
   - Updates price indexes relative to baseline
   - Alerts on >5% daily changes

4. **🌍 Global Events Monitoring (Crisis Detection)**
   - Monitors news feeds for major events (wars, pandemics, disasters, financial crises)
   - AI classifies severity and impact
   - Flags affected cities and projects
   - Analyst review queue for major events

5. **📊 Exchange Rates (Cost Impact)**
   - Checks currency exchange APIs
   - Updates rates for cities with foreign material imports
   - Flags major currency movements (>2% change)

**How Pulse Works:**
- **Cloud Function** scheduled to run daily at 6:00 AM (configurable)
- **Parallel Collectors** scrape all sources simultaneously
- **AI Analyzers** process collected data (entity extraction, sentiment analysis)
- **Storage** writes to Firestore collections (newsArticles, externalMacroeconomic, externalSupplyChain, externalEvents)
- **Notifications** alert users to high-priority findings

**User Experience:**
- **Pulse Dashboard** - Summary of what was collected that morning
- **AI Chat Integration** - "What's new in the market today?" gets instant briefing
- **Push Notifications** - Configurable alerts for tracked offices, rate changes, price spikes
- **Fresh Data Ready** - By the time users log in, all intelligence is up-to-date

**Technical Implementation:**
- Firebase Cloud Functions with PubSub scheduler
- Individual collectors for each data type (newsCollector.ts, ratesCollector.ts, commodityCollector.ts, etc.)
- Claude API integration for AI entity extraction and sentiment analysis
- Health monitoring and error recovery
- Admin dashboard for monitoring Pulse performance

**Cost Estimate:** ~$175-400/month for complete Pulse operation

**Dependencies:**
- Dormant collections activated (newsArticles, externalMacroeconomic, externalSupplyChain, externalEvents)
- Cloud Functions infrastructure
- News API subscriptions (ArchDaily, Dezeen, Bloomberg, FT)
- Central bank API access (free)
- Commodity exchange API access

**Future V2 Enhancements:**
- Real-time monitoring mode (not just daily at 6 AM)
- Predictive alerts (AI predicts rate changes before they happen)
- Custom feeds per user
- Social media monitoring (Twitter, LinkedIn)
- Image analysis from project photos and renderings

**Future V3 Enhancements:**
- Multi-timezone support (different pulse times per region)
- Competitive intelligence tracking
- Tender monitoring (scrape public tender databases)
- Patent tracking (architecture/construction patents)

### 24/7 Background Automation
- **Background Service:** Continuously running data ingestion
- **Menu Bar App:** macOS menu bar application for background processing
- **Web Scraping:** Automated scraping of architecture news, firm websites, project databases
- **RSS Feed Integration:** Monitor industry publications, blogs, news sources
- **API Integrations:** Connect to external data sources (LinkedIn, company APIs, public databases)
- **Email Ingestion:** Parse incoming emails for relevant data
- **Auto-Processing:** AI automatically categorizes and processes all incoming data
- **Auto-Categorization:** Incoming data automatically sorted into correct collections
- **Autonomous Entry Creation:** AI creates Firestore entries without user intervention
- **24/7 Operation:** Runs continuously in background while computer is on
- **Smart Notifications:** Alert user to significant findings or events
- **Research Assistant Mode:** Like having a research assistant working around the clock

### Market Consolidation Tracking & Analysis
- **HHI Calculation:** Herfindahl-Hirschman Index for market concentration
- **Gini Coefficient:** Measure market inequality and consolidation
- **M&A Tracking:** Monitor mergers, acquisitions, and consolidations
- **Market Share Analysis:** Track market share changes over time
- **Consolidation Trends:** Identify consolidation patterns and trends
- **Competitive Dynamics:** Analyze how consolidation affects competition
- **7 Consolidation Categories:** Specialized tracking per market segment

### Network Graph Advanced Features
- **Graph Computation:** Calculate network metrics and relationships
- **Connection Strength:** Measure relationship intensity between entities
- **Cluster Detection:** Identify groups and communities within network
- **Centrality Analysis:** Find most influential/connected entities
- **Path Finding:** Shortest path between any two entities
- **Network Visualization:** Interactive graph displays
- **Relationship Patterns:** Detect patterns in connections over time

### Timeline & History Features
- **Historical Tracking:** Complete timeline of company evolution
- **M&A Timeline:** Visual timeline of mergers and acquisitions
- **Event Correlation:** Connect events to business outcomes
- **Historical Analysis:** Analyze patterns from historical data
- **Company Evolution:** Track how companies change over time
- **Leadership Changes:** Monitor leadership transitions and impact

### Cross-Platform Distribution
- **Windows .exe Installer:** Native Windows application
- **Linux AppImage:** Linux distribution package
- **Code Signing:** All platforms properly signed
- **Auto-Updates:** Built-in update mechanism
- **Cross-Platform Sync:** Data sync across different platforms

### Web App Companion
- **Mobile/Phone Access:** Responsive web version for mobile devices
- **Subset of Features:** Lightweight version with essential features
- **Read-Only Mode:** View data on mobile, edit on desktop
- **Quick Search:** Fast search and retrieval on mobile
- **Notifications:** Push notifications for important updates
- **Sync with Desktop:** Real-time sync with desktop application

### Advanced AI Features
- **Predictive Analytics:** AI predicts market trends and outcomes
- **Anomaly Detection:** Automatically detect unusual patterns
- **Natural Language Queries:** Ask questions in plain language
- **Smart Recommendations:** AI suggests actions and insights
- **Automated Reports:** AI generates reports automatically
- **Sentiment Analysis:** Analyze sentiment from news and media
- **Pattern Recognition:** Identify patterns across all data types

---

## Implementation Priority

When building future features, suggested priority order:

### Phase 6: Enhanced Data Collection (After Phase 5)
1. Client operations and UI
2. Workforce operations and UI
3. Financial operations and UI
4. News article tracking (manual collection first)

### Phase 7: External Context (After Phase 6)
1. External Forces tracking (all 7 categories)
2. Political Context tracking
3. City/Land data enrichment
4. Supply chain monitoring

### Phase 8: Market Consolidator - Market Intelligence (After Phase 7)

**Market Consolidator implementation in 7 sub-phases:**

1. **Core Metrics:**
   - Create `/marketIntelligence` collection
   - HHI calculation function
   - Gini coefficient calculation
   - CR4/CR8 concentration ratios
   - Data aggregation pipeline

2. **M&A Tracking:**
   - Extend `/archHistory` with consolidation events
   - M&A event entry UI
   - Acquisition timeline tracking
   - Deal value tracking

3. **Network Analysis:**
   - Create `/networkGraph` collection
   - Centrality calculations (degree, betweenness, closeness)
   - Client concentration metrics
   - Supplier exclusivity tracking

4. **Pricing & Competition:**
   - Premium index calculations
   - Average bidders per RFP tracking
   - Client switching rate monitoring
   - Pricing power indicators

5. **Barriers & Entry Metrics:**
   - New firm formation rate tracking
   - Survival curves by firm size
   - Capital requirements trends
   - Technology adoption cost monitoring

6. **Dashboard & Visualization:**
   - Consolidation overview dashboard
   - M&A activity timeline view
   - Pricing power charts
   - Network centralization graphs
   - Alert/warning system UI

7. **AI Integration:**
   - Register consolidation query actions
   - Trend detection capabilities
   - Conversational market analysis
   - Automated report generation

### Phase 9: Advanced Analytics (After Phase 8)
1. Division percentage analytics
2. Predictive analytics across all data types
3. Scenario modeling and forecasting
4. Cross-entity pattern recognition
5. Advanced AI insights and recommendations

### Phase 10: Pulse - Automated Daily Collection (After Phase 9)
1. Set up Cloud Functions infrastructure
2. Build core collectors (news, interest rates)
3. Integrate Claude API for entity extraction and sentiment analysis
4. Add commodity price and exchange rate monitoring
5. Add global events monitoring
6. Build Pulse dashboard UI
7. Integrate with AI chat for briefings
8. Add user notification preferences
9. Set up health monitoring and admin dashboard
10. Performance optimization and reliability testing

**Note:** Pulse requires dormant collections (newsArticles, externalMacroeconomic, externalSupplyChain, externalEvents) to be activated first in Phases 6-8.

### Phase 11: 24/7 Background Automation (After Phase 10)
1. Background service framework
2. Web scraping implementation beyond Pulse
3. RSS feed integration for continuous monitoring
4. Email ingestion
5. Auto-processing pipeline
6. Menu bar app for macOS
7. 24/7 autonomous operation (beyond scheduled Pulse)

### Phase 12: Cross-Platform & Mobile (After Phase 11)
1. Windows .exe installer
2. Linux AppImage
3. Web app companion
4. Mobile optimization
5. Cross-platform sync

---

## Notes

- **All 31 collections** are created in Phase 2, but only 3 are actively used
- **Database structure** supports all future features from day one
- **Infrastructure** is built to accommodate future expansion
- **No breaking changes** required to add future features
- **Modular design** allows features to be added incrementally
- **General Engine** will automatically apply design system to new features as they're added
- **Action Registry** is extensible - new actions can be added without refactoring

---

## Current Build vs. Future Features

### What YOU'RE BUILDING NOW:
- Offices, Projects, Regulations (3 collections active)
- Basic CRUD operations for these 3 entities
- Cross UI command center
- AI orchestrator for active entities
- General Engine foundation
- Beautiful main app UI for active features

### What COMES LATER:
- Everything in this document
- 28 dormant collections activated
- **Market Consolidator** - Comprehensive market intelligence with HHI, Gini, M&A tracking, network analysis (7 categories, 20+ metrics)
- **Pulse** - Automated daily intelligence collection (news, rates, commodity prices, events)
- Advanced analytics and predictive modeling
- 24/7 background automation
- Cross-platform distribution
- Web/mobile companion apps

**The foundation you're building now supports all of this future expansion without requiring architectural changes.**

**Note:** Both Market Consolidator and Pulse are fully designed and documented systems, ready for implementation once the core MVP (offices, projects, regulations) is operational.

