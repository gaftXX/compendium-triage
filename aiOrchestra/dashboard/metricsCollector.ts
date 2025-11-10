import { DashboardMetrics, RequestLog, LiveActivity, HealthStatus, PerformanceData } from './types';

export class MetricsCollector {
  private static instance: MetricsCollector;
  
  private metrics: DashboardMetrics;
  private requestLogs: RequestLog[] = [];
  private liveActivities: LiveActivity[] = [];
  private performanceHistory: PerformanceData[] = [];
  private maxLogs: number = 100;
  private maxActivities: number = 50;
  private maxPerformanceHistory: number = 100;
  
  private constructor() {
    this.metrics = this.initializeMetrics();
  }
  
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  private initializeMetrics(): DashboardMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      intentBreakdown: {},
      toolUsageBreakdown: {},
      mostUsedTool: '',
      actionsRequiringApproval: 0,
      actionsApproved: 0,
      actionsRejected: 0,
      actionsCancelled: 0,
      fastestRequest: Infinity,
      slowestRequest: 0,
      errorRate: 0,
      commonErrors: [],
      lastUpdated: new Date()
    };
  }
  
  public recordRequest(log: RequestLog): void {
    this.metrics.totalRequests++;
    
    if (log.status === 'success') {
      this.metrics.successfulRequests++;
    } else if (log.status === 'failed') {
      this.metrics.failedRequests++;
    } else if (log.status === 'cancelled') {
      this.metrics.actionsCancelled++;
    }
    
    this.metrics.totalTokensUsed += log.tokensUsed;
    this.metrics.totalCost += log.cost;
    
    this.metrics.intentBreakdown[log.intent] = (this.metrics.intentBreakdown[log.intent] || 0) + 1;
    
    log.toolsUsed.forEach(tool => {
      this.metrics.toolUsageBreakdown[tool] = (this.metrics.toolUsageBreakdown[tool] || 0) + 1;
    });
    
    this.metrics.actionsRequiringApproval += log.actionsTaken;
    this.metrics.actionsApproved += log.actionsApproved;
    this.metrics.actionsRejected += log.actionsRejected;
    
    this.metrics.fastestRequest = Math.min(this.metrics.fastestRequest, log.responseTime);
    this.metrics.slowestRequest = Math.max(this.metrics.slowestRequest, log.responseTime);
    
    const totalResponseTime = this.requestLogs.reduce((sum, r) => sum + r.responseTime, 0) + log.responseTime;
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;
    
    this.metrics.errorRate = (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
    
    if (log.error) {
      const existing = this.metrics.commonErrors.find(e => e.error === log.error);
      if (existing) {
        existing.count++;
      } else {
        this.metrics.commonErrors.push({ error: log.error, count: 1 });
      }
      this.metrics.commonErrors.sort((a, b) => b.count - a.count);
      this.metrics.commonErrors = this.metrics.commonErrors.slice(0, 5);
    }
    
    const mostUsedEntry = Object.entries(this.metrics.toolUsageBreakdown)
      .sort(([,a], [,b]) => b - a)[0];
    this.metrics.mostUsedTool = mostUsedEntry ? mostUsedEntry[0] : '';
    
    this.metrics.lastUpdated = new Date();
    
    this.requestLogs.push(log);
    if (this.requestLogs.length > this.maxLogs) {
      this.requestLogs.shift();
    }
    
    this.recordPerformance({
      timestamp: log.timestamp,
      responseTime: log.responseTime,
      tokensUsed: log.tokensUsed,
      successRate: (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
    });
  }
  
  public addActivity(activity: LiveActivity): void {
    this.liveActivities.unshift(activity);
    if (this.liveActivities.length > this.maxActivities) {
      this.liveActivities.pop();
    }
  }
  
  private recordPerformance(data: PerformanceData): void {
    this.performanceHistory.push(data);
    if (this.performanceHistory.length > this.maxPerformanceHistory) {
      this.performanceHistory.shift();
    }
  }
  
  public getMetrics(): DashboardMetrics {
    return { ...this.metrics };
  }
  
  public getRequestLogs(limit?: number): RequestLog[] {
    const logs = [...this.requestLogs].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }
  
  public getLiveActivities(limit?: number): LiveActivity[] {
    return limit ? this.liveActivities.slice(0, limit) : [...this.liveActivities];
  }
  
  public getPerformanceHistory(limit?: number): PerformanceData[] {
    return limit ? this.performanceHistory.slice(-limit) : [...this.performanceHistory];
  }
  
  public getHealthStatus(): HealthStatus {
    const recentLogs = this.requestLogs.slice(-20);
    const recentErrors = recentLogs.filter(l => l.status === 'failed').length;
    const recentErrorRate = recentLogs.length > 0 ? (recentErrors / recentLogs.length) * 100 : 0;
    
    const avgResponseTime = recentLogs.length > 0
      ? recentLogs.reduce((sum, l) => sum + l.responseTime, 0) / recentLogs.length
      : 0;
    
    const claudeStatus = recentErrorRate > 20 ? 'down' : recentErrorRate > 5 ? 'degraded' : 'operational';
    const overallStatus = recentErrorRate > 20 ? 'unhealthy' : recentErrorRate > 5 ? 'degraded' : 'healthy';
    
    return {
      overall: overallStatus,
      claude: {
        status: claudeStatus,
        latency: avgResponseTime,
        errorRate: recentErrorRate
      },
      firebase: {
        status: 'operational',
        latency: 100,
        errorRate: 0
      },
      intentRouter: {
        status: 'operational',
        cacheHitRate: 75,
        averageClassificationTime: 1200
      },
      toolExecutor: {
        status: 'operational',
        successRate: 100 - this.metrics.errorRate,
        averageExecutionTime: 500
      }
    };
  }
  
  public reset(): void {
    this.metrics = this.initializeMetrics();
    this.requestLogs = [];
    this.liveActivities = [];
    this.performanceHistory = [];
  }
  
  public setMaxLogs(max: number): void {
    this.maxLogs = max;
  }
  
  public setMaxActivities(max: number): void {
    this.maxActivities = max;
  }
  
  public setMaxPerformanceHistory(max: number): void {
    this.maxPerformanceHistory = max;
  }
}

