import { MetricsCollector } from './metricsCollector';
import { DashboardRenderer } from './dashboardRenderer';
import { TestRunner } from './testRunner';
import { DashboardConfig, RequestLog, LiveActivity } from './types';

export class Dashboard {
  private static instance: Dashboard;
  private metricsCollector: MetricsCollector;
  private renderer: DashboardRenderer;
  private testRunner: TestRunner;
  private config: DashboardConfig;
  private isRunning: boolean = false;
  private refreshInterval: NodeJS.Timeout | null = null;
  private showTestPanel: boolean = false;
  private testResults: any[] = [];
  
  private constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.renderer = new DashboardRenderer();
    this.testRunner = TestRunner.getInstance();
    this.config = {
      refreshInterval: 1000, // 1 second
      maxLogsToShow: 10,
      maxActivityItems: 20,
      performanceHistoryLength: 60,
      alertThresholds: {
        errorRate: 10, // 10%
        responseTime: 10000, // 10s
        cost: 1.0 // $1/hour
      }
    };
  }
  
  public static getInstance(): Dashboard {
    if (!Dashboard.instance) {
      Dashboard.instance = new Dashboard();
    }
    return Dashboard.instance;
  }
  
  public start(): void {
    if (this.isRunning) {
      console.log('Dashboard is already running');
      return;
    }
    
    this.isRunning = true;
    this.setupKeyboardControls();
    this.render();
    
    this.refreshInterval = setInterval(() => {
      this.render();
    }, this.config.refreshInterval);
    
    this.printControls();
  }
  
  private setupKeyboardControls(): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      process.stdin.on('data', async (key: string) => {
        if (key === '\u0003') {
          this.stop();
          process.exit(0);
        }
        
        if (key === 't' || key === 'T') {
          this.showTestPanel = !this.showTestPanel;
          this.render();
        }
        
        if (key === 'r' || key === 'R') {
          this.reset();
          this.render();
        }
        
        if (key === '1') {
          await this.runTest('nav_1');
        }
        
        if (key === '2') {
          await this.runTest('query_1');
        }
        
        if (key === '3') {
          await this.runTest('create_1');
        }
        
        if (key === 'a' || key === 'A') {
          await this.runAllTests();
        }
      });
    }
  }
  
  private printControls(): void {
    console.log('\n' + '═'.repeat(80));
    console.log('CONTROLS:');
    console.log('  T = Toggle Test Panel    R = Reset Metrics    Ctrl+C = Exit');
    console.log('  1 = Run Navigation Test  2 = Run Query Test   3 = Run Create Test');
    console.log('  A = Run All Tests');
    console.log('═'.repeat(80) + '\n');
  }
  
  public stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isRunning = false;
    console.log('\nDashboard stopped.');
  }
  
  private render(): void {
    this.clearScreen();
    
    const metrics = this.metricsCollector.getMetrics();
    const health = this.metricsCollector.getHealthStatus();
    const recentLogs = this.metricsCollector.getRequestLogs(this.config.maxLogsToShow);
    const liveActivities = this.metricsCollector.getLiveActivities(this.config.maxActivityItems);
    const performanceHistory = this.metricsCollector.getPerformanceHistory(this.config.performanceHistoryLength);
    
    const dashboard = this.renderer.renderDashboard(
      metrics,
      health,
      recentLogs,
      liveActivities,
      performanceHistory,
      this.showTestPanel,
      this.testRunner.getScenarios(),
      this.testResults
    );
    
    console.log(dashboard);
    
    this.checkAlerts(metrics);
    this.printControls();
  }
  
  private clearScreen(): void {
    console.clear();
  }
  
  private checkAlerts(metrics: any): void {
    const alerts: string[] = [];
    
    if (metrics.errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(`⚠️  HIGH ERROR RATE: ${metrics.errorRate.toFixed(1)}% (threshold: ${this.config.alertThresholds.errorRate}%)`);
    }
    
    if (metrics.averageResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push(`⚠️  SLOW RESPONSE TIME: ${metrics.averageResponseTime.toFixed(0)}ms (threshold: ${this.config.alertThresholds.responseTime}ms)`);
    }
    
    const costPerHour = metrics.totalCost * (3600000 / (Date.now() - metrics.lastUpdated.getTime()));
    if (costPerHour > this.config.alertThresholds.cost) {
      alerts.push(`⚠️  HIGH COST RATE: $${costPerHour.toFixed(2)}/hour (threshold: $${this.config.alertThresholds.cost}/hour)`);
    }
    
    if (alerts.length > 0) {
      console.log('\n\x1b[33m' + alerts.join('\n') + '\x1b[0m');
    }
  }
  
  public recordRequest(log: RequestLog): void {
    this.metricsCollector.recordRequest(log);
  }
  
  public addActivity(activity: LiveActivity): void {
    this.metricsCollector.addActivity(activity);
  }
  
  public reset(): void {
    this.metricsCollector.reset();
    console.log('Dashboard metrics reset.');
  }
  
  public configure(config: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.refreshInterval && this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = setInterval(() => {
        this.render();
      }, this.config.refreshInterval);
    }
  }
  
  public exportMetrics(): string {
    const metrics = this.metricsCollector.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }
  
  public getMetricsSnapshot() {
    return {
      metrics: this.metricsCollector.getMetrics(),
      health: this.metricsCollector.getHealthStatus(),
      recentLogs: this.metricsCollector.getRequestLogs(10),
      activities: this.metricsCollector.getLiveActivities(10)
    };
  }
  
  public setApiKey(apiKey: string): void {
    this.testRunner.setApiKey(apiKey);
  }
  
  private async runTest(scenarioId: string): Promise<void> {
    this.metricsCollector.addActivity({
      type: 'request',
      timestamp: new Date(),
      message: `Running test: ${scenarioId}`,
      details: { scenarioId }
    });
    
    const result = await this.testRunner.runScenario(scenarioId, false);
    this.testResults.unshift(result);
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
    
    this.render();
  }
  
  private async runAllTests(): Promise<void> {
    this.metricsCollector.addActivity({
      type: 'request',
      timestamp: new Date(),
      message: 'Running all tests...',
      details: {}
    });
    
    const result = await this.testRunner.runAllScenarios(false);
    this.testResults = result.results.slice(0, 10);
    
    this.render();
  }
  
  public toggleTestPanel(): void {
    this.showTestPanel = !this.showTestPanel;
  }
}

// Standalone CLI runner
if (require.main === module) {
  const dashboard = Dashboard.getInstance();
  dashboard.start();
  
  process.on('SIGINT', () => {
    dashboard.stop();
    process.exit(0);
  });
}

