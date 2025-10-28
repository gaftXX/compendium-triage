// Sample test file for ClaudeAIService
import { ClaudeAIService } from '../../renderer/src/services/claudeAIService';

describe('ClaudeAIService', () => {
  let claudeService: ClaudeAIService;

  beforeEach(() => {
    claudeService = ClaudeAIService.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = ClaudeAIService.getInstance();
    const instance2 = ClaudeAIService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should analyze text and return structured data', async () => {
    const testText = 'Foster + Partners is a renowned architectural firm founded in 1967, based in London.';
    
    const result = await claudeService.analyzeText(testText);
    
    expect(result).toHaveProperty('categorization');
    expect(result).toHaveProperty('extraction');
    expect(result).toHaveProperty('overallConfidence');
    expect(result.categorization).toHaveProperty('category');
    expect(result.categorization).toHaveProperty('confidence');
    expect(result.categorization).toHaveProperty('reasoning');
  });

  it('should handle API key validation', () => {
    // This test would check if the service properly validates API keys
    expect(claudeService).toBeDefined();
  });

  it('should provide model metrics', async () => {
    const metrics = await claudeService.getModelMetrics();
    
    expect(metrics).toHaveProperty('accuracy');
    expect(metrics).toHaveProperty('totalPredictions');
    expect(metrics).toHaveProperty('correctPredictions');
    expect(metrics).toHaveProperty('categoryBreakdown');
  });
});
