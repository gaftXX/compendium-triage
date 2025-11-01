// Translation Service - Translates any language input to English using Claude AI

export interface TranslationResult {
  success: boolean;
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  error?: string;
}

export class TranslationService {
  private static instance: TranslationService;
  private apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY || '';
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translate text to English if it's not already in English
   */
  public async translateToEnglish(text: string): Promise<TranslationResult> {
    try {
      console.log('Translation Service: Analyzing text language...');
      
      if (!this.apiKey) {
        throw new Error('No Anthropic API key found for translation');
      }

      // First, detect if the text is already in English
      const isEnglish = await this.detectEnglish(text);
      
      if (isEnglish) {
        console.log('Text is already in English, no translation needed');
        return {
          success: true,
          originalText: text,
          translatedText: text,
          detectedLanguage: 'English'
        };
      }

      // Translate to English
      console.log('Translating text to English...');
      const translatedText = await this.performTranslation(text);
      
      console.log('Translation completed');
      return {
        success: true,
        originalText: text,
        translatedText: translatedText,
        detectedLanguage: 'Non-English'
      };

    } catch (error) {
      console.error('Translation failed:', error);
      return {
        success: false,
        originalText: text,
        translatedText: text, // Fallback to original text
        error: error instanceof Error ? error.message : 'Translation failed'
      };
    }
  }

  /**
   * Detect if text is already in English
   */
  private async detectEnglish(text: string): Promise<boolean> {
    try {
      const prompt = `Analyze this text and determine if it's written in English. Respond with only "YES" if it's English, or "NO" if it's in another language.

Text: "${text}"`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 50,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.content?.[0]?.text?.trim().toUpperCase();
      
      return result === 'YES';
    } catch (error) {
      console.error('Language detection failed:', error);
      // Assume English if detection fails
      return true;
    }
  }

  /**
   * Perform the actual translation
   */
  private async performTranslation(text: string): Promise<string> {
    const prompt = `Translate the following text to English. Maintain the original meaning, tone, and structure. If the text is already in English, return it unchanged.

Text to translate: "${text}"

Translated text:`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.content?.[0]?.text?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received from API');
    }

    return translatedText;
  }
}
