# AI Orchestra Monitoring Dashboard

## Overview

Terminal-based dashboard for monitoring AI Orchestra health, testing components, and analyzing performance in real-time.

## Dashboard UI (Terminal View)

```
╔════════════════════════════════════════════════════════════════╗
║                   AI ORCHESTRA DASHBOARD                       ║
║                        STATUS: ACTIVE                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  [SYSTEM STATUS]                                               ║
║  ● Claude API       [●] CONNECTED  (4.5 Haiku)               ║
║  ● Registry         [●] LOADED     (42 actions, 7 domains)    ║
║  ● Intent Router    [●] READY                                 ║
║  ● Domain Handlers  [●] 7/7 LOADED                            ║
║  ● Firebase         [●] CONNECTED                             ║
║                                                                ║
║  [METRICS - LAST 24H]                                          ║
║  Total Queries:     147                                        ║
║  Avg Response Time: 1.2s                                       ║
║  Router Accuracy:   94.6%                                      ║
║  Success Rate:      97.3%                                      ║
║  Total Cost:        $0.32                                      ║
║                                                                ║
║  [DOMAIN USAGE]                                                ║
║  DATA_CRUD          ████████░░ 42  (28.6%)                    ║
║  DATA_QUERY         ██████████ 51  (34.7%)                    ║
║  NAVIGATION         ████░░░░░░ 18  (12.2%)                    ║
║  RESEARCH           ███░░░░░░░ 15  (10.2%)                    ║
║  ANALYSIS           ██░░░░░░░░  8  ( 5.4%)                    ║
║  NOTE_PROCESSING    ███░░░░░░░ 11  ( 7.5%)                    ║
║  SYSTEM             █░░░░░░░░░  2  ( 1.4%)                    ║
║                                                                ║
║  [RECENT ACTIVITY]                                             ║
║  12:34:15 ● DATA_QUERY    "how many offices?"     → 1.1s      ║
║  12:33:42 ● DATA_CRUD     "create office X"       → 1.4s      ║
║  12:32:18 ● NAVIGATION    "open projects"         → 0.8s      ║
║  12:31:05 ● DATA_QUERY    "which has most?"       → 1.3s      ║
║  12:29:33 ● NOTE_PROC     "add note / ..."        → 2.1s      ║
║                                                                ║
║  [ERRORS - LAST 1H]                                            ║
║  12:28:14 ✗ Router failed to classify intent                  ║
║  12:15:22 ✗ Claude API timeout (retry succeeded)              ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  [COMMANDS]                                                    ║
║  t: Run Tests   │   r: Reload Registry   │   l: View Logs    ║
║  s: Statistics  │   c: Clear Metrics     │   q: Quit         ║
╚════════════════════════════════════════════════════════════════╝
```

## Testing Interface

### Test Suite Menu

```
╔════════════════════════════════════════════════════════════════╗
║                      AI ORCHESTRA TESTS                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  [COMPONENT TESTS]                                             ║
║  1. Test Intent Router                                         ║
║  2. Test Domain Handlers                                       ║
║  3. Test Action Registry                                       ║
║  4. Test Claude API                                            ║
║  5. Test Firebase Connection                                   ║
║  6. Test Tool Execution                                        ║
║                                                                ║
║  [INTEGRATION TESTS]                                           ║
║  7. Test Full Query Pipeline                                   ║
║  8. Test Multi-Step Workflows                                  ║
║  9. Test Context Awareness                                     ║
║  10. Test Error Recovery                                       ║
║                                                                ║
║  [PERFORMANCE TESTS]                                           ║
║  11. Test Response Times                                       ║
║  12. Test Token Usage                                          ║
║  13. Test Concurrent Queries                                   ║
║                                                                ║
║  [VALIDATION TESTS]                                            ║
║  14. Test Router Accuracy                                      ║
║  15. Test Tool Selection                                       ║
║  16. Test Parameter Extraction                                 ║
║                                                                ║
║  a: Run All Tests   │   b: Back to Dashboard                  ║
╚════════════════════════════════════════════════════════════════╝
```

## Test Examples

### Test 1: Intent Router Accuracy

```
Running: Intent Router Accuracy Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Case 1: "Create office Foster Partners in London"
Expected:  DATA_CRUD
Result:    DATA_CRUD ✓
Confidence: 0.98
Time:      0.3s

Test Case 2: "How many offices do we have?"
Expected:  DATA_QUERY
Result:    DATA_QUERY ✓
Confidence: 0.95
Time:      0.2s

Test Case 3: "Open the projects list"
Expected:  NAVIGATION
Result:    NAVIGATION ✓
Confidence: 0.99
Time:      0.2s

Test Case 4: "Find information about Zaha Hadid Architects"
Expected:  RESEARCH
Result:    RESEARCH ✓
Confidence: 0.92
Time:      0.3s

Test Case 5: "Compare offices A and B"
Expected:  ANALYSIS
Result:    ANALYSIS ✓
Confidence: 0.94
Time:      0.3s

Test Case 6: "Boris Pena Arquitectos is based in Barcelona..."
Expected:  NOTE_PROCESSING
Result:    NOTE_PROCESSING ✓
Confidence: 0.97
Time:      0.3s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results: 6/6 passed (100%)
Average Confidence: 0.96
Average Time: 0.27s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Test 2: Full Pipeline Test

```
Running: Full Query Pipeline Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Query: "Create office Foster Partners in London and find their website"

[Stage 1: Intent Classification]
→ Classified as: DATA_CRUD + RESEARCH (multi-step)
→ Time: 0.3s
→ Status: ✓

[Stage 2: Domain Routing]
→ Primary Domain: DATA_CRUD
→ Secondary Domain: RESEARCH
→ Tools Loaded: 15
→ Time: 0.1s
→ Status: ✓

[Stage 3: Action Planning]
→ Step 1: create_office
→ Step 2: search_web
→ Step 3: update_office
→ Time: 0.4s
→ Status: ✓

[Stage 4: Execution]
→ Executing: create_office({name: "Foster Partners", city: "London"})
→ Result: Office created (UKLD001)
→ Time: 0.8s
→ Status: ✓

→ Executing: search_web("Foster Partners architects website")
→ Result: Found "fosterandpartners.com"
→ Time: 1.2s
→ Status: ✓

→ Executing: update_office(UKLD001, {website: "fosterandpartners.com"})
→ Result: Office updated
→ Time: 0.6s
→ Status: ✓

[Stage 5: Response Synthesis]
→ Generated response
→ Time: 0.3s
→ Status: ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Time: 3.7s
Total Cost: $0.008
Status: SUCCESS ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Test 3: Performance Benchmark

```
Running: Performance Benchmark
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Testing 100 queries across all domains...

Domain: DATA_CRUD (20 queries)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: ████████████████████ 100%
Avg Response: 1.2s
Success Rate: 100%
Cost: $0.04

Domain: DATA_QUERY (20 queries)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: ████████████████████ 100%
Avg Response: 1.0s
Success Rate: 100%
Cost: $0.03

Domain: NAVIGATION (15 queries)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Progress: ████████████████████ 100%
Avg Response: 0.8s
Success Rate: 100%
Cost: $0.02

[... other domains ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary:
Total Queries:    100
Total Time:       112.5s
Avg Response:     1.1s
Success Rate:     99%
Total Cost:       $0.22
Queries/Second:   0.9
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Implementation

### Dashboard Service

```
File: services/aiOrchestra/monitoring/dashboardService.ts

class DashboardService {
  private metrics: MetricsCollector;
  private testRunner: TestRunner;
  
  async start() {
    // Initialize terminal UI
    const screen = blessed.screen();
    
    // Create dashboard layout
    const dashboard = this.createDashboard(screen);
    
    // Start metrics collection
    this.metrics.start();
    
    // Update dashboard every second
    setInterval(() => {
      this.updateDashboard(dashboard);
    }, 1000);
    
    // Handle keyboard input
    this.setupKeyboardHandlers(screen);
    
    screen.render();
  }
  
  private createDashboard(screen) {
    // Use blessed library for terminal UI
    return {
      status: blessed.box({ /* config */ }),
      metrics: blessed.box({ /* config */ }),
      domainUsage: blessed.bar({ /* config */ }),
      recentActivity: blessed.list({ /* config */ }),
      errors: blessed.log({ /* config */ })
    };
  }
}
```

### Metrics Collector

```
File: services/aiOrchestra/monitoring/metricsCollector.ts

class MetricsCollector {
  private queries: QueryMetric[] = [];
  
  recordQuery(query: QueryMetric) {
    this.queries.push({
      timestamp: Date.now(),
      intent: query.intent,
      domain: query.domain,
      responseTime: query.responseTime,
      success: query.success,
      cost: query.cost,
      toolsCalled: query.toolsCalled
    });
  }
  
  getMetrics(timeRange: string): Metrics {
    const filtered = this.filterByTimeRange(this.queries, timeRange);
    
    return {
      totalQueries: filtered.length,
      avgResponseTime: this.average(filtered.map(q => q.responseTime)),
      successRate: filtered.filter(q => q.success).length / filtered.length,
      totalCost: filtered.reduce((sum, q) => sum + q.cost, 0),
      domainBreakdown: this.groupByDomain(filtered),
      routerAccuracy: this.calculateRouterAccuracy(filtered)
    };
  }
}
```

### Test Runner

```
File: services/aiOrchestra/monitoring/testRunner.ts

class TestRunner {
  async runTest(testName: string): Promise<TestResult> {
    switch(testName) {
      case 'intent_router':
        return await this.testIntentRouter();
      case 'domain_handlers':
        return await this.testDomainHandlers();
      case 'action_registry':
        return await this.testActionRegistry();
      // ... other tests
    }
  }
  
  private async testIntentRouter(): Promise<TestResult> {
    const testCases = [
      { query: "Create office X", expected: "DATA_CRUD" },
      { query: "How many offices?", expected: "DATA_QUERY" },
      // ... more test cases
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      const result = await this.router.classify(testCase.query);
      results.push({
        passed: result.domain === testCase.expected,
        confidence: result.confidence,
        time: result.time
      });
    }
    
    return {
      name: 'Intent Router Accuracy',
      passed: results.filter(r => r.passed).length,
      total: results.length,
      avgConfidence: this.average(results.map(r => r.confidence)),
      avgTime: this.average(results.map(r => r.time))
    };
  }
}
```

## Key Metrics to Track

### System Health
- Claude API status (connected/error)
- Registry loaded (action count)
- Domain handlers ready
- Firebase connection
- Response time (p50, p95, p99)

### Usage Metrics
- Total queries (1h, 24h, 7d)
- Queries per domain
- Success rate
- Error rate
- Most used tools

### Performance Metrics
- Average response time per domain
- Token usage per query
- Cost per query
- Cache hit rate (if caching)

### Quality Metrics
- Router classification accuracy
- Tool selection accuracy
- Parameter extraction accuracy
- User satisfaction (if collected)

## Critical Tests

### 1. Intent Router Accuracy
Test that router correctly classifies queries into domains

### 2. Domain Handler Coverage
Test that all domains have required tools loaded

### 3. Action Registry Completeness
Test that all actions are discoverable and valid

### 4. Tool Execution
Test that tools execute correctly with valid inputs

### 5. Error Recovery
Test that system handles errors gracefully

### 6. Multi-Step Workflows
Test that complex queries with multiple actions work

### 7. Context Awareness
Test that system uses context correctly

### 8. Performance Under Load
Test concurrent queries and response times

## Automated Testing

### Continuous Testing

```
Run tests:
- On every build
- On registry update
- Hourly in production
- On demand via dashboard
```

### Test Data Sets

```
test-cases/
├── intent-classification.json    # Router test cases
├── domain-handling.json           # Domain handler tests
├── tool-execution.json            # Tool execution tests
├── multi-step-workflows.json      # Complex workflow tests
└── edge-cases.json                # Edge cases and errors
```

### Regression Testing

```
When changes made:
1. Run full test suite
2. Compare metrics to baseline
3. Flag any degradation
4. Require manual approval if metrics worse
```

## Alerts

### Critical Alerts (Immediate Action)
- Claude API disconnected
- Success rate drops below 90%
- Average response time > 5s
- Error rate > 10%

### Warning Alerts (Monitor)
- Router accuracy < 95%
- Cost spike (> 2x normal)
- Firebase slow responses
- Cache miss rate > 20%

### Info Alerts (FYI)
- New record high query volume
- Domain usage pattern change
- New tool added to registry

## Dashboard Commands

### Real-Time Commands

```
t - Run Tests           : Launch test suite
r - Reload Registry     : Refresh action registry
l - View Logs           : Show detailed logs
s - Statistics          : Show detailed stats
c - Clear Metrics       : Reset metric counters
d - Debug Mode          : Enable verbose logging
p - Performance Report  : Generate performance analysis
e - Export Data         : Export metrics to CSV
q - Quit                : Exit dashboard
```

## Integration with Development

### Development Mode

```
npm run dev:dashboard

Opens dashboard in development mode:
- Auto-reloads on code changes
- Shows detailed debug info
- Runs tests on file save
- Highlights errors immediately
```

### Production Mode

```
npm run dashboard:prod

Opens production monitoring:
- Real production metrics
- Alert monitoring
- Performance tracking
- User query analytics
```

## Conclusion

Terminal dashboard provides:
- Real-time system monitoring
- Comprehensive testing
- Performance analysis
- Quality metrics
- Development tool

Essential for maintaining and improving AI Orchestra system quality and reliability.

