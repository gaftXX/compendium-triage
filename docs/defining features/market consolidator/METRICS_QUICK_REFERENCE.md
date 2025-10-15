# Market Consolidation Metrics - Quick Reference Guide

Quick lookup for all consolidation metrics and their meanings.

---

## Primary Concentration Metrics

### Herfindahl-Hirschman Index (HHI)
**Formula:** `HHI = Σ(market share²) × 10,000`  
**Range:** 0 - 10,000  
**Interpretation:**
- 0-1,500: Competitive market
- 1,500-2,500: Moderately concentrated
- 2,500-10,000: Highly concentrated
- >2,500: Potential antitrust concern

**Signal:** Rising HHI = market consolidating

---

### Gini Coefficient
**Formula:** `Gini = (Σ|xi - xj|) / (2n²μ)`  
**Range:** 0 - 1  
**Interpretation:**
- 0: Perfect equality (all firms equal revenue)
- 0.3-0.4: Relatively equal distribution
- 0.4-0.6: Moderate inequality
- 0.6-1.0: High inequality (few firms dominate)

**Signal:** Rising Gini = increasing inequality, consolidation

---

### CR4 (Top 4 Concentration Ratio)
**Formula:** `CR4 = (Top 4 firms revenue / Total market revenue) × 100`  
**Range:** 0% - 100%  
**Interpretation:**
- <40%: Competitive market
- 40-60%: Moderate oligopoly
- >60%: Tight oligopoly (consolidated)

**Signal:** Rising CR4 = oligopolistic consolidation

---

### CR8 (Top 8 Concentration Ratio)
**Formula:** `CR8 = (Top 8 firms revenue / Total market revenue) × 100`  
**Use:** Secondary concentration measure

---

## Pricing Power Metrics

### Premium Index
**Formula:** `(Top tier avg fee - Market avg fee) / Market avg fee × 100`  
**Interpretation:** % premium that top firms charge over market average  
**Signal:** Rising premium = pricing power from consolidation

---

### Lerner Index (Price-Cost Margin)
**Formula:** `L = (Price - Marginal Cost) / Price`  
**Range:** 0 - 1  
**Interpretation:**
- 0: Perfect competition (no markup)
- 0.2-0.4: Competitive
- >0.5: Strong pricing power (consolidated market)

**Signal:** Rising Lerner = pricing power from consolidation

---

### Average Bidders per RFP
**Tracks:** Average number of firms bidding per project request  
**Signal:** Declining bidders = less competition, more concentration

---

### Client Switching Rate
**Formula:** `(Clients switching firms / Total clients) × 100`  
**Signal:** Declining switching = client lock-in by dominant firms

---

## Barrier to Entry Metrics

### New Firm Formation Rate
**Formula:** `New firms founded / Total existing firms × 100`  
**Signal:** Declining formation rate = harder to enter market

---

### 5-Year Survival Rate
**Formula:** `(Firms still active / Firms founded 5 years ago) × 100`  
**Breakdown by:** Boutique, Medium, Large, Global firms  
**Signal:** Declining survival for small firms = consolidation pressure

---

### Net Entry Rate
**Formula:** `Entry Rate - Exit Rate`  
**Signal:** Negative net entry = consolidation (more exits than entries)

---

## Network Centralization Metrics

### Client Concentration HHI
**Formula:** HHI calculation based on client distribution (not revenue)  
**Signal:** Rising client HHI = few firms serving most clients

---

### Network Centrality Scores
**Degree Centrality:** # of connections per firm  
**Betweenness Centrality:** How often firm is bridge between others  
**Closeness Centrality:** Average distance to all other firms  
**Influence Score:** Computed overall influence (1-10 scale)

**Signal:** Few firms with high centrality = centralized network

---

### Supplier Exclusivity Rate
**Formula:** `(Exclusive supplier deals / Total supplier relationships) × 100`  
**Signal:** Rising exclusivity = large firms locking resources

---

## Strategic Behavior Metrics

### Partnership Formation Rate
**Tracks:** # of new partnerships per year  
**Types:** Joint ventures, strategic alliances, co-designs  
**Signal:** Rising partnerships = oligopolistic cooperation

---

### Geographic Expansion Rate
**Formula:** `(Firms with multiple locations / Total firms) × 100`  
**Signal:** Large firms expanding = market share grab

---

### Cross-Sector Expansion
**Formula:** `(Firms with 3+ specializations / Total firms) × 100`  
**Signal:** Firms diversifying to dominate

---

## M&A Activity Metrics

### Annual M&A Count
**Tracks:** Number of acquisitions and mergers per year  
**Signal:** Increasing M&A = market consolidating

---

### Average Deal Value
**Tracks:** Average $ value of acquisitions  
**Signal:** Rising deal values = firms willing to pay more for market share

---

### Brand Retention Rate
**Formula:** `(Acquired firms keeping brand / Total acquisitions) × 100`  
**Signal:** Declining retention = fewer independent players

---

### Employee Impact Ratio
**Formula:** `Employees retained / (Retained + Laid off)`  
**Tracks:** Post-acquisition employment impact

---

## Market Dynamics Metrics

### Dominance Index
**Formula:** `Market share of largest firm / Market share of 2nd largest`  
**Interpretation:**
- DI < 2: Competitive duopoly
- DI 2-4: Moderate dominance
- DI > 4: Clear market leader

---

### Instability Index
**Tracks:** Count of firms changing ranking positions period-over-period  
**Signal:** Decreasing instability = entrenched positions

---

### Market Growth Rate
**Formula:** `((Current Period Revenue - Previous Period Revenue) / Previous Period Revenue) × 100`  
**Context:** Consolidation can occur in growing OR declining markets

---

## Data Sources (Firestore)

| Metric Category | Primary Collections |
|----------------|---------------------|
| Concentration (HHI, Gini, CR4) | offices, financials, projects |
| Pricing Power | projects, financials, clients |
| Barriers to Entry | offices (founded, status) |
| Network Centralization | networkGraph, relationships |
| M&A Activity | archHistory, relationships |
| Strategic Behavior | relationships, offices |

---

## Alert Thresholds

### High Consolidation
**Trigger:** `HHI > 2500 AND Gini > 0.6`  
**Message:** Market highly concentrated - potential antitrust concern

---

### Accelerating Consolidation
**Trigger:** `HHI change > 200 AND M&A activity > avg × 1.5`  
**Message:** Consolidation accelerating - increased M&A activity

---

### Rising Barriers
**Trigger:** `Formation rate < 3% AND Closure rate > 10%`  
**Message:** Market barriers rising - new firm formation declining

---

### Pricing Power Surge
**Trigger:** `Premium index > 150 AND Avg bidders < 3`  
**Message:** Dominant firms exhibiting strong pricing power

---

## Consolidation Trend Classification

### Algorithm Logic

```typescript
if (HHI change > 100 AND Gini change > 0.05 AND CR4 > 60 AND formation rate < 5) {
  return 'CONSOLIDATING';
}

if (HHI change < -100 AND Gini change < -0.05 AND formation rate > 15) {
  return 'FRAGMENTING';
}

return 'STABLE';
```

---

*For detailed formulas, data sources, and implementation details, see MARKET_CONSOLIDATION_TRACKING.md*

