import { DashboardMetrics, RequestLog, LiveActivity, HealthStatus, PerformanceData } from './types';

export class DashboardRenderer {
  private width: number = 120;
  
  public renderDashboard(
    metrics: DashboardMetrics,
    health: HealthStatus,
    _recentLogs: RequestLog[],
    liveActivities: LiveActivity[],
    _performanceHistory: PerformanceData[],
    showTestPanel: boolean = false,
    testScenarios: any[] = [],
    testResults: any[] = []
  ): string {
    const sections: string[] = [];
    
    sections.push(this.renderHeader());
    
    if (showTestPanel) {
      sections.push(this.renderTestPanel(testScenarios, testResults));
    } else {
      sections.push(this.renderSimplePanel(metrics, health, liveActivities));
    }
    
    sections.push(this.renderControls());
    
    return sections.join('\n\n');
  }

  private renderSimplePanel(metrics: DashboardMetrics, health: HealthStatus, activities: LiveActivity[]): string {
    let output = '┌─ AI ORCHESTRA STATUS ───────────────────────────────────────────────┐\n';
    
    // System status
    const statusIcon = health.overall === 'healthy' ? '●' : '○';
    output += `│ System: ${statusIcon} ${health.overall.toUpperCase().padEnd(10)} │ `;
    
    // Quick stats
    const successRate = metrics.totalRequests > 0 
      ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(0)
      : '0';
    output += `Requests: ${String(metrics.totalRequests).padEnd(4)} │ `;
    output += `Success: ${successRate}% │\n`;
    
    output += '├─────────────────────────────────────────────────────────────────────┤\n';
    
    // Recent activity
    if (activities.length > 0) {
      output += '│ RECENT ACTIVITY:                                                  │\n';
      activities.slice(-5).forEach(activity => {
        const time = activity.timestamp.toLocaleTimeString();
        const msg = activity.message.slice(0, 42);
        output += `│ ${time} - ${msg.padEnd(42)} │\n`;
      });
    } else {
      output += '│                                                                   │\n';
      output += '│  No activity yet. Press 1, 2, 3, or A to run tests.              │\n';
      output += '│                                                                   │\n';
    }
    
    output += '└─────────────────────────────────────────────────────────────────────┘';
    
    return output;
  }

  private renderControls(): string {
    return `
════════════════════════════════════════════════════════════════════════
CONTROLS:
  T = Toggle Test Panel    R = Reset Metrics    Ctrl+C = Exit
  1 = Run Navigation Test  2 = Run Query Test   3 = Run Create Test
  A = Run All Tests
════════════════════════════════════════════════════════════════════════`;
  }
  
  private renderHeader(): string {
    const title = ' AI ORCHESTRA DASHBOARD ';
    const padding = '═'.repeat(Math.floor((this.width - title.length) / 2));
    return `\n${padding}${title}${padding}`;
  }
  
  private _renderHealthStatus(health: HealthStatus): string {
    const statusIcon = (status: string) => {
      if (status === 'operational' || status === 'healthy') return '●';
      if (status === 'degraded') return '◐';
      return '○';
    };
    
    return `
┌─ SYSTEM HEALTH ─────────────────────────────────────────────────────────────┐
│ Overall: ${statusIcon(health.overall)} ${health.overall.toUpperCase()}                                                    │
│                                                                               │
│ ┌─ Components ───────────────────────────────────────────────────────────┐   │
│ │ Claude AI:       ${statusIcon(health.claude.status)} ${health.claude.status}  (${health.claude.latency}ms, ${health.claude.errorRate.toFixed(1)}% errors)                 │   │
│ │ Firebase:        ${statusIcon(health.firebase.status)} ${health.firebase.status}  (${health.firebase.latency}ms, ${health.firebase.errorRate.toFixed(1)}% errors)              │   │
│ │ Intent Router:   ${statusIcon(health.intentRouter.status)} ${health.intentRouter.status}  (${health.intentRouter.averageClassificationTime}ms, ${health.intentRouter.cacheHitRate}% cache hit)   │   │
│ │ Tool Executor:   ${statusIcon(health.toolExecutor.status)} ${health.toolExecutor.status}  (${health.toolExecutor.averageExecutionTime}ms, ${health.toolExecutor.successRate.toFixed(1)}% success)   │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────┘`;
  }
  
  private _renderKeyMetrics(metrics: DashboardMetrics): string {
    const successRate = metrics.totalRequests > 0 
      ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
      : '0.0';
    
    const approvalRate = metrics.actionsRequiringApproval > 0
      ? ((metrics.actionsApproved / metrics.actionsRequiringApproval) * 100).toFixed(1)
      : '0.0';
    
    return `
┌─ KEY METRICS ───────────────────────────────────────────────────────────────┐
│ Total Requests:        ${this.padRight(metrics.totalRequests.toString(), 10)}    Success Rate:      ${successRate}%        │
│ Successful:            ${this.padRight(metrics.successfulRequests.toString(), 10)}    Avg Response:      ${metrics.averageResponseTime.toFixed(0)}ms       │
│ Failed:                ${this.padRight(metrics.failedRequests.toString(), 10)}    Fastest:           ${metrics.fastestRequest === Infinity ? 'N/A' : metrics.fastestRequest + 'ms'}        │
│ Cancelled:             ${this.padRight(metrics.actionsCancelled.toString(), 10)}    Slowest:           ${metrics.slowestRequest}ms       │
│                                                                               │
│ Tokens Used:           ${this.padRight(metrics.totalTokensUsed.toLocaleString(), 10)}    Approval Rate:     ${approvalRate}%        │
│ Total Cost:            $${metrics.totalCost.toFixed(4)}        Most Used Tool:    ${this.truncate(metrics.mostUsedTool, 20)}     │
└───────────────────────────────────────────────────────────────────────────────┘`;
  }
  
  private _renderIntentBreakdown(metrics: DashboardMetrics): string {
    const intents = Object.entries(metrics.intentBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    
    const maxCount = Math.max(...intents.map(([,count]) => count), 1);
    
    let output = `
┌─ INTENT DISTRIBUTION ───────────────────────────────────────────────────────┐`;
    
    if (intents.length === 0) {
      output += `\n│ No data yet                                                                  │`;
    } else {
      intents.forEach(([intent, count]) => {
        const percentage = (count / metrics.totalRequests * 100).toFixed(1);
        const barLength = Math.floor((count / maxCount) * 40);
        const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
        output += `\n│ ${this.padRight(intent, 18)} ${bar} ${this.padLeft(count.toString(), 4)} (${percentage}%)    │`;
      });
    }
    
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    return output;
  }
  
  private _renderToolUsage(metrics: DashboardMetrics): string {
    const tools = Object.entries(metrics.toolUsageBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    
    const maxCount = Math.max(...tools.map(([,count]) => count), 1);
    
    let output = `
┌─ TOOL USAGE ────────────────────────────────────────────────────────────────┐`;
    
    if (tools.length === 0) {
      output += `\n│ No tools used yet                                                            │`;
    } else {
      tools.forEach(([tool, count]) => {
        const barLength = Math.floor((count / maxCount) * 40);
        const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
        output += `\n│ ${this.padRight(tool, 22)} ${bar} ${this.padLeft(count.toString(), 4)}          │`;
      });
    }
    
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    return output;
  }
  
  private _renderApprovalMetrics(metrics: DashboardMetrics): string {
    const total = metrics.actionsRequiringApproval;
    const approved = metrics.actionsApproved;
    const rejected = metrics.actionsRejected;
    const cancelled = metrics.actionsCancelled;
    
    const approvedPct = total > 0 ? (approved / total * 100).toFixed(1) : '0.0';
    const rejectedPct = total > 0 ? (rejected / total * 100).toFixed(1) : '0.0';
    const cancelledPct = total > 0 ? (cancelled / total * 100).toFixed(1) : '0.0';
    
    return `
┌─ APPROVAL METRICS ──────────────────────────────────────────────────────────┐
│ Total Actions:         ${this.padRight(total.toString(), 10)}    Approved:          ${approved} (${approvedPct}%)       │
│ Approved:              ${this.padRight(approved.toString(), 10)}    Rejected:          ${rejected} (${rejectedPct}%)       │
│ Rejected:              ${this.padRight(rejected.toString(), 10)}    Cancelled:         ${cancelled} (${cancelledPct}%)       │
└───────────────────────────────────────────────────────────────────────────────┘`;
  }
  
  private _renderPerformanceGraph(history: PerformanceData[]): string {
    const recent = history.slice(-30);
    
    if (recent.length === 0) {
      return `
┌─ RESPONSE TIME (Last 30 requests) ─────────────────────────────────────────┐
│ No data yet                                                                  │
└───────────────────────────────────────────────────────────────────────────────┘`;
    }
    
    const maxTime = Math.max(...recent.map(d => d.responseTime), 1);
    const graphHeight = 8;
    
    let output = `
┌─ RESPONSE TIME (Last 30 requests) ─────────────────────────────────────────┐`;
    
    for (let y = graphHeight; y >= 0; y--) {
      const threshold = (y / graphHeight) * maxTime;
      let line = '│ ';
      
      for (let i = 0; i < recent.length; i++) {
        const time = recent[i].responseTime;
        line += time >= threshold ? '█' : ' ';
      }
      
      line += ' '.repeat(Math.max(0, 75 - line.length)) + '│';
      output += `\n${line}`;
    }
    
    output += `\n│ ${'─'.repeat(73)} │`;
    output += `\n│ Max: ${maxTime.toFixed(0)}ms                                                          │`;
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    
    return output;
  }
  
  private _renderLiveActivity(activities: LiveActivity[]): string {
    const recent = activities.slice(0, 5);
    
    let output = `
┌─ LIVE ACTIVITY ─────────────────────────────────────────────────────────────┐`;
    
    if (recent.length === 0) {
      output += `\n│ No activity yet                                                              │`;
    } else {
      recent.forEach(activity => {
        const time = activity.timestamp.toLocaleTimeString();
        const icon = this.getActivityIcon(activity.type);
        const msg = this.truncate(activity.message, 60);
        output += `\n│ ${time} ${icon} ${this.padRight(msg, 62)} │`;
      });
    }
    
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    return output;
  }
  
  private _renderRecentLogs(logs: RequestLog[]): string {
    const recent = logs.slice(0, 5);
    
    let output = `
┌─ RECENT REQUESTS ───────────────────────────────────────────────────────────┐`;
    
    if (recent.length === 0) {
      output += `\n│ No requests yet                                                              │`;
    } else {
      recent.forEach(log => {
        const status = log.status === 'success' ? '✓' : log.status === 'failed' ? '✗' : '○';
        const input = this.truncate(log.userInput, 40);
        const time = log.responseTime.toFixed(0);
        output += `\n│ ${status} ${this.padRight(input, 42)} ${this.padRight(log.intent, 15)} ${time}ms      │`;
      });
    }
    
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    return output;
  }
  
  private _renderErrors(metrics: DashboardMetrics): string {
    let output = `
┌─ COMMON ERRORS ─────────────────────────────────────────────────────────────┐`;
    
    if (metrics.commonErrors.length === 0) {
      output += `\n│ No errors (all systems operational)                                          │`;
    } else {
      metrics.commonErrors.forEach(({ error, count }) => {
        const errorMsg = this.truncate(error, 60);
        output += `\n│ [${count}x] ${this.padRight(errorMsg, 70)} │`;
      });
    }
    
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    return output;
  }
  
  private getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      request: '→',
      intent: '◆',
      tool_execution: '⚙',
      approval: '✓',
      completion: '✓',
      error: '✗'
    };
    return icons[type] || '•';
  }
  
  private padRight(str: string, length: number): string {
    return str + ' '.repeat(Math.max(0, length - str.length));
  }
  
  private padLeft(str: string, length: number): string {
    return ' '.repeat(Math.max(0, length - str.length)) + str;
  }
  
  private truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + '...';
  }
  
  private renderTestPanel(scenarios: any[], results: any[]): string {
    let output = `
┌─ TEST SCENARIOS ────────────────────────────────────────────────────────────┐`;
    
    const categories = ['navigation', 'query', 'create', 'update', 'delete', 'web', 'chat'];
    
    categories.forEach(category => {
      const categoryScenarios = scenarios.filter((s: any) => s.category === category);
      if (categoryScenarios.length > 0) {
        output += `\n│                                                                               │`;
        output += `\n│ ${this.padRight(category.toUpperCase(), 73)} │`;
        categoryScenarios.slice(0, 3).forEach((scenario: any) => {
          const key = scenario.id === 'nav_1' ? '[1]' : scenario.id === 'query_1' ? '[2]' : scenario.id === 'create_1' ? '[3]' : '   ';
          const name = this.truncate(scenario.name, 35);
          const approval = scenario.requiresApproval ? '⚠' : '✓';
          output += `\n│ ${key} ${this.padRight(name, 40)} ${approval} ${this.padRight(scenario.category, 12)} │`;
        });
      }
    });
    
    output += `\n│                                                                               │`;
    output += `\n│ Press [1][2][3] to run individual tests | [A] to run all tests               │`;
    output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    
    if (results.length > 0) {
      output += `\n\n┌─ TEST RESULTS ──────────────────────────────────────────────────────────────┐`;
      
      results.slice(0, 3).forEach((result: any) => {
        const status = result.success ? '✓' : '✗';
        const name = this.truncate(result.scenario.name, 35);
        const time = `${result.timeTaken}ms`;
        const statusText = result.success ? 'PASS' : 'FAIL';
        output += `\n│ ${status} ${this.padRight(name, 37)} ${this.padRight(statusText, 6)} ${this.padLeft(time, 8)}       │`;
        
        // Show detailed steps
        if (result.steps && result.steps.length > 0) {
          result.steps.slice(-4).forEach((step: any) => {
            const stepIcon = step.status === 'completed' ? '  ✓' : 
                           step.status === 'running' ? '  →' :
                           step.status === 'waiting' ? '  ⏸' :
                           step.status === 'error' ? '  ✗' : '  •';
            const stepName = this.truncate(step.step, 50);
            const stepTime = `${step.time}ms`;
            output += `\n│ ${stepIcon} ${this.padRight(stepName, 63)} ${this.padLeft(stepTime, 6)} │`;
            
            // Show step details if available
            if (step.details) {
              if (step.details.intent) {
                output += `\n│      Intent: ${this.padRight(step.details.intent, 61)} │`;
              }
              if (step.details.tools && step.details.tools.length > 0) {
                const tools = step.details.tools.join(', ');
                output += `\n│      Tools: ${this.padRight(this.truncate(tools, 62), 62)} │`;
              }
              if (step.details.executed !== undefined) {
                output += `\n│      Executed: ${step.details.executed}  Failed: ${step.details.failed}${' '.repeat(50)} │`;
              }
            }
          });
        }
        
        if (!result.success && result.error) {
          const error = this.truncate(result.error, 68);
          output += `\n│   ✗ Error: ${this.padRight(error, 63)} │`;
        }
        
        output += `\n│${' '.repeat(79)}│`;
      });
      
      output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
      
      const passed = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;
      const total = results.length;
      const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
      
      output += `\n\n┌─ TEST SUMMARY ──────────────────────────────────────────────────────────────┐`;
      output += `\n│ Total: ${this.padRight(total.toString(), 4)}   Passed: ${this.padRight(passed.toString(), 4)} (${passRate}%)   Failed: ${this.padRight(failed.toString(), 4)}                           │`;
      output += `\n└───────────────────────────────────────────────────────────────────────────────┘`;
    }
    
    return output;
  }
}

