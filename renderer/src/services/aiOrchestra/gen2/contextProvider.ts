type KnownPage =
  | 'cross'
  | 'bt-view'
  | 'offices-list'
  | 'projects-list'
  | 'regulations-list'
  | 'map'
  | 'meditations-list';

export interface AppContext {
  currentPage: KnownPage | 'unknown';
  openWindows: string[];
  selectedEntity?: {
    type: 'office' | 'project' | 'regulation';
    id: string;
    name: string;
  };
  recentActions: string[];
  timestamp: Date;
}

export class ContextProvider {
  private static instance: ContextProvider;
  private currentContext: AppContext;

  private constructor() {
    this.currentContext = {
      currentPage: 'unknown',
      openWindows: [],
      recentActions: [],
      timestamp: new Date()
    };
  }

  public static getInstance(): ContextProvider {
    if (!ContextProvider.instance) {
      ContextProvider.instance = new ContextProvider();
    }
    return ContextProvider.instance;
  }

  public updateContext(updates: Partial<AppContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...updates,
      timestamp: new Date()
    };
  }

  public setCurrentPage(page: AppContext['currentPage']): void {
    this.currentContext.currentPage = page;
    this.currentContext.timestamp = new Date();
  }

  public addOpenWindow(windowId: string): void {
    if (!this.currentContext.openWindows.includes(windowId)) {
      this.currentContext.openWindows.push(windowId);
    }
    this.currentContext.timestamp = new Date();
  }

  public removeOpenWindow(windowId: string): void {
    this.currentContext.openWindows = this.currentContext.openWindows.filter(w => w !== windowId);
    this.currentContext.timestamp = new Date();
  }

  public setSelectedEntity(type: 'office' | 'project' | 'regulation', id: string, name: string): void {
    this.currentContext.selectedEntity = { type, id, name };
    this.currentContext.timestamp = new Date();
  }

  public addRecentAction(action: string): void {
    this.currentContext.recentActions.unshift(action);
    if (this.currentContext.recentActions.length > 10) {
      this.currentContext.recentActions = this.currentContext.recentActions.slice(0, 10);
    }
    this.currentContext.timestamp = new Date();
  }

  public getContext(): AppContext {
    return { ...this.currentContext };
  }

  public getContextForAI(): string {
    const ctx = this.currentContext;
    
    let contextString = `Current App State:
- Page: ${ctx.currentPage}`;

    if (ctx.openWindows.length > 0) {
      contextString += `\n- Open Windows: ${ctx.openWindows.join(', ')}`;
    }

    if (ctx.selectedEntity) {
      contextString += `\n- Selected ${ctx.selectedEntity.type}: ${ctx.selectedEntity.name} (ID: ${ctx.selectedEntity.id})`;
    }

    if (ctx.recentActions.length > 0) {
      contextString += `\n- Recent Actions:\n  ${ctx.recentActions.slice(0, 5).map((a, i) => `${i + 1}. ${a}`).join('\n  ')}`;
    }

    return contextString;
  }
}

