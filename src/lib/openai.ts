import OpenAI from 'openai';

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Default configuration
 */
const defaultConfig = {
  model: process.env.OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
};

/**
 * Generate content suggestions using AI
 */
export async function generateContentSuggestions(
  prompt: string,
  type: 'tags' | 'title' | 'description' | 'content',
  context?: string
) {
  try {
    const systemPrompts = {
      tags: 'You are a content tagging expert. Generate relevant, SEO-friendly tags for the given content. Return only a comma-separated list of tags, no explanations.',
      title:
        'You are a copywriting expert. Generate compelling, SEO-friendly titles for the given content. Return only the title, no explanations.',
      description:
        'You are a content marketing expert. Generate engaging, SEO-optimized descriptions for the given content. Keep it under 160 characters for meta descriptions.',
      content:
        'You are a professional content writer. Improve and enhance the given content while maintaining its original intent and style.',
    };

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompts[type],
      },
      {
        role: 'user',
        content: context ? `Context: ${context}\n\nContent: ${prompt}` : prompt,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: defaultConfig.model,
      messages,
      max_tokens: defaultConfig.maxTokens,
      temperature: defaultConfig.temperature,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error(
      `Failed to generate ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate SEO metadata using AI
 */
export async function generateSEOMetadata(content: string, title?: string) {
  try {
    const prompt = `
Content Title: ${title || 'N/A'}
Content: ${content}

Generate SEO metadata for this content including:
1. Meta title (50-60 characters)
2. Meta description (150-160 characters)
3. Keywords (5-10 relevant keywords)
4. Tags (5-8 content tags)

Format the response as JSON with keys: metaTitle, metaDescription, keywords, tags
`;

    const completion = await openai.chat.completions.create({
      model: defaultConfig.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an SEO expert. Generate comprehensive SEO metadata for the given content. Return only valid JSON, no explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response) as {
      metaTitle: string;
      metaDescription: string;
      keywords: string[];
      tags: string[];
    };
  } catch (error) {
    console.error('SEO metadata generation error:', error);
    throw new Error(
      `Failed to generate SEO metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Improve content quality using AI
 */
export async function improveContent(
  content: string,
  improvements: Array<
    'grammar' | 'clarity' | 'engagement' | 'seo' | 'readability'
  >
) {
  try {
    const improvementPrompts = {
      grammar: 'Fix grammar, spelling, and punctuation errors',
      clarity: 'Improve clarity and coherence',
      engagement: 'Make the content more engaging and compelling',
      seo: 'Optimize for search engines while maintaining readability',
      readability: 'Improve readability and flow',
    };

    const selectedImprovements = improvements
      .map(imp => improvementPrompts[imp])
      .join(', ');

    const prompt = `
Improve the following content by focusing on: ${selectedImprovements}

Original content:
${content}

Return only the improved content, maintaining the original structure and intent.
`;

    const completion = await openai.chat.completions.create({
      model: defaultConfig.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional content editor. Improve the given content according to the specified criteria while maintaining the original voice and intent.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: Math.min(defaultConfig.maxTokens * 2, 2000),
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content?.trim() || content;
  } catch (error) {
    console.error('Content improvement error:', error);
    throw new Error(
      `Failed to improve content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate blog post suggestions
 */
export async function generateBlogSuggestions(
  topic: string,
  tone: 'professional' | 'casual' | 'technical' | 'creative' = 'professional'
) {
  try {
    const tonePrompts = {
      professional: 'professional and authoritative',
      casual: 'casual and conversational',
      technical: 'technical and detailed',
      creative: 'creative and engaging',
    };

    const prompt = `
Generate blog post suggestions for the topic: "${topic}"

Create 5 blog post ideas with the following structure for each:
- Title: Compelling and SEO-friendly
- Outline: 4-5 main points
- Target audience: Who would benefit from this content
- Estimated reading time: In minutes

Use a ${tonePrompts[tone]} tone throughout.

Format as JSON array with keys: title, outline, targetAudience, readingTime
`;

    const completion = await openai.chat.completions.create({
      model: defaultConfig.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a content strategist. Generate practical and engaging blog post suggestions. Return only valid JSON, no explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response) as Array<{
      title: string;
      outline: string[];
      targetAudience: string;
      readingTime: number;
    }>;
  } catch (error) {
    console.error('Blog suggestions error:', error);
    throw new Error(
      `Failed to generate blog suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Analyze content sentiment and quality
 */
export async function analyzeContent(content: string) {
  try {
    const prompt = `
Analyze the following content and provide:
1. Sentiment (positive, neutral, negative)
2. Readability score (1-10, where 10 is most readable)
3. Engagement potential (1-10, where 10 is most engaging)
4. SEO friendliness (1-10, where 10 is most SEO optimized)
5. Key themes (3-5 main themes)
6. Improvement suggestions (2-3 actionable suggestions)

Content:
${content}

Format as JSON with keys: sentiment, readabilityScore, engagementScore, seoScore, themes, suggestions
`;

    const completion = await openai.chat.completions.create({
      model: defaultConfig.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a content analyst. Provide objective analysis of the given content. Return only valid JSON, no explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response) as {
      sentiment: 'positive' | 'neutral' | 'negative';
      readabilityScore: number;
      engagementScore: number;
      seoScore: number;
      themes: string[];
      suggestions: string[];
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    throw new Error(
      `Failed to analyze content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get usage statistics (if available)
 */
export async function getOpenAIUsage() {
  try {
    // Note: OpenAI doesn't provide usage stats through the API
    // This is a placeholder for potential future implementation
    return {
      available: false,
      message: 'Usage statistics not available through API',
    };
  } catch (error) {
    console.error('Usage stats error:', error);
    return {
      available: false,
      message: 'Failed to retrieve usage statistics',
    };
  }
}

export { openai };
