// Test utility to demonstrate enhanced Claude categorization system
// This file demonstrates how the system now enforces Claude's logic for identifying project/office/regulation types

import { ClaudeAIService } from '../renderer/src/services/claudeAIService';
import { NoteProcessingEngine } from './noteProcessingEngine';

export class CategorizationTest {
  
  /**
   * Test examples to demonstrate Claude's enhanced categorization logic
   */
  private static testExamples = [
    {
      text: "Foster + Partners is a renowned architectural firm founded in 1967, based in London with over 200 employees specializing in sustainable design and high-rise buildings.",
      expectedCategory: "office",
      description: "Clear architectural firm description"
    },
    {
      text: "The Burj Khalifa is a 828-meter tall skyscraper in Dubai, completed in 2010, designed by Adrian Smith of SOM. It's the world's tallest building.",
      expectedCategory: "project", 
      description: "Famous building project"
    },
    {
      text: "International Building Code (IBC) 2024 requires all commercial buildings over 75 feet to have automatic fire suppression systems in all occupied areas.",
      expectedCategory: "regulation",
      description: "Building code regulation"
    },
    {
      text: "Gensler is expanding their New York office with a new 50,000 sq ft space in Manhattan, hiring 25 new architects and designers.",
      expectedCategory: "office",
      description: "Company expansion news"
    },
    {
      text: "Central Park Tower residential development in Manhattan will feature 131 condominiums and retail space, budget $3 billion.",
      expectedCategory: "project",
      description: "Mixed-use development project"
    },
    {
      text: "New York City zoning law requires all new residential buildings in R8 districts to maintain 30% affordable housing units.",
      expectedCategory: "regulation", 
      description: "Zoning regulation"
    }
  ];

  /**
   * Run categorization tests to demonstrate Claude's enhanced logic
   */
  public static async runCategorizationTests(): Promise<void> {
    console.log('🧪 Running Claude Categorization Tests...');
    console.log('=====================================');

    const claudeAI = ClaudeAIService.getInstance();
    
    for (const test of this.testExamples) {
      try {
        console.log(`\n📝 Testing: ${test.description}`);
        console.log(`Input: "${test.text}"`);
        
        const result = await claudeAI.analyzeText(test.text);
        
        console.log(`✅ Claude's Decision:`);
        console.log(`   Category: ${result.categorization.category}`);
        console.log(`   Confidence: ${(result.categorization.confidence * 100).toFixed(1)}%`);
        console.log(`   Reasoning: ${result.categorization.reasoning}`);
        console.log(`   Expected: ${test.expectedCategory}`);
        console.log(`   Match: ${result.categorization.category === test.expectedCategory ? '✅ CORRECT' : '❌ INCORRECT'}`);
        
      } catch (error) {
        console.error(`❌ Test failed for "${test.description}":`, error);
      }
    }
    
    console.log('\n🏁 Categorization tests completed!');
  }

  /**
   * Test the full note processing pipeline
   */
  public static async runFullPipelineTests(): Promise<void> {
    console.log('\n🔄 Running Full Pipeline Tests...');
    console.log('==================================');

    const processingEngine = NoteProcessingEngine.getInstance();
    
    for (const test of this.testExamples.slice(0, 3)) { // Test first 3 examples
      try {
        console.log(`\n📝 Processing: ${test.description}`);
        
        const result = await processingEngine.processNote(test.text);
        
        console.log(`✅ Pipeline Result:`);
        console.log(`   Success: ${result.success}`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Confidence: ${((result.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`   Preview: ${result.preview}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Pipeline test failed for "${test.description}":`, error);
      }
    }
    
    console.log('\n🏁 Pipeline tests completed!');
  }

  /**
   * Demonstrate confidence threshold behavior
   */
  public static async demonstrateConfidenceThresholds(): Promise<void> {
    console.log('\n📊 Demonstrating Confidence Thresholds...');
    console.log('==========================================');
    
    const ambiguousExamples = [
      "Architecture firm building a new office",
      "Construction project by engineering company", 
      "Building code for architectural projects"
    ];

    const processingEngine = NoteProcessingEngine.getInstance();
    
    for (const text of ambiguousExamples) {
      try {
        console.log(`\n📝 Ambiguous input: "${text}"`);
        
        const result = await processingEngine.processNote(text);
        
        console.log(`✅ Result:`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Confidence: ${((result.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`   Accepted: ${result.success ? 'YES' : 'NO'}`);
        console.log(`   Reason: ${result.error || 'High confidence - accepted'}`);
        
      } catch (error) {
        console.error(`❌ Test failed:`, error);
      }
    }
  }
}

// Export for use in development/testing
export default CategorizationTest;
