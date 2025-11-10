// Dashboard Types

export interface DashboardMetrics {
  // Real-time metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number; // in ms
  
  // Token usage
  totalTokensUsed: number;
  totalCost: number; // in USD
  
  // Intent distribution
  intentBreakdown: Record<string, number>;
  
  // Tool usage
  toolUsageBreakdown: Record<string, number>;
  mostUsedTool: string;
  
  // Approval metrics
  actionsRequiringApproval: number;
  actionsApproved: number;
  actionsRejected: number;
  actionsCancelled: number;
  
  // Performance
  fastestRequest: number; // in ms
  slowestRequest: number; // in ms
  
  // Errors
  errorRate: number; // percentage
  commonErrors: Array<{ error: string; count: number }>;
  
  // Timestamp
  lastUpdated: Date;
}

export interface RequestLog {
  id: string;
  timestamp: Date;
  userInput: string;
  intent: string;
  intentConfidence: number;
  toolsUsed: string[];
  responseTime: number; // in ms
  tokensUsed: number;
  cost: number; // in USD
  status: 'success' | 'failed' | 'cancelled';
  error?: string;
  actionsTaken: number;
  actionsApproved: number;
  actionsRejected: number;
}

export interface LiveActivity {
  type: 'request' | 'intent' | 'tool_execution' | 'approval' | 'completion' | 'error';
  timestamp: Date;
  message: string;
  details?: any;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  claude: {
    status: 'operational' | 'degraded' | 'down';
    latency: number; // in ms
    errorRate: number; // percentage
  };
  firebase: {
    status: 'operational' | 'degraded' | 'down';
    latency: number; // in ms
    errorRate: number; // percentage
  };
  intentRouter: {
    status: 'operational' | 'degraded' | 'down';
    cacheHitRate: number; // percentage
    averageClassificationTime: number; // in ms
  };
  toolExecutor: {
    status: 'operational' | 'degraded' | 'down';
    successRate: number; // percentage
    averageExecutionTime: number; // in ms
  };
}

export interface PerformanceData {
  timestamp: Date;
  responseTime: number;
  tokensUsed: number;
  successRate: number;
}

export interface DashboardConfig {
  refreshInterval: number; // in ms
  maxLogsToShow: number;
  maxActivityItems: number;
  performanceHistoryLength: number;
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // in ms
    cost: number; // in USD per hour
  };
}

