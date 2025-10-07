/**
 * Bulk import utilities for flashcards
 * Supports: Markdown (frontmatter), JSON, CSV, YAML
 */

interface CardPrompt {
  text?: string;
  richText?: string;
  media?: {
    lottieIds?: string[];
    imageUrls?: string[];
    audioUrl?: string;
  };
}

interface CardResponse {
  text?: string;
  richText?: string;
  media?: {
    lottieIds?: string[];
    imageUrls?: string[];
    audioUrl?: string;
  };
}

export interface BulkCardData {
  type?: 'basic' | 'cloze' | 'multi-choice';
  prompt: CardPrompt;
  response: CardResponse;
  hint?: string;
  explanation?: string;
  tags?: string[];
}

export interface ParseResult {
  success: boolean;
  cards?: BulkCardData[];
  error?: string;
}

/**
 * Parse bulk import file based on file type
 */
export async function parseBulkImportFile(
  content: string,
  fileType: string
): Promise<ParseResult> {
  try {
    switch (fileType) {
      case 'md':
      case 'markdown':
        return parseMarkdownFile(content);
      case 'json':
        return parseJsonFile(content);
      case 'csv':
        return parseCsvFile(content);
      case 'yaml':
      case 'yml':
        return parseYamlFile(content);
      default:
        return {
          success: false,
          error: `Unsupported file type: ${fileType}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Parse error',
    };
  }
}

/**
 * Parse Markdown file with frontmatter
 * Expected format:
 * ---
 * title: Deck Title
 * ---
 * ## Card 1
 * Q: Question text
 * A: Answer text
 * ---
 * ## Card 2
 * ...
 */
function parseMarkdownFile(content: string): ParseResult {
  try {
    // Simple frontmatter extraction (replace matter library)
    let body = content;
    const frontmatterMatch = content.match(
      /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
    );
    if (frontmatterMatch) {
      body = frontmatterMatch[2];
    }

    const cards: BulkCardData[] = [];

    // Split by --- or ## to find individual cards
    const cardBlocks = body
      .split(/(?:^|\n)(?:---|\#{2,})/m)
      .filter((b: string) => b.trim());

    for (const block of cardBlocks) {
      const lines = block.trim().split('\n');
      let prompt = '';
      let response = '';
      let hint = '';
      let explanation = '';
      let tags: string[] = [];
      let currentSection:
        | 'prompt'
        | 'response'
        | 'hint'
        | 'explanation'
        | null = null;

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) continue;

        // Check for section markers
        if (/^Q:|^Question:/i.test(trimmed)) {
          currentSection = 'prompt';
          prompt = trimmed.replace(/^Q:|^Question:/i, '').trim();
          continue;
        }
        if (/^A:|^Answer:/i.test(trimmed)) {
          currentSection = 'response';
          response = trimmed.replace(/^A:|^Answer:/i, '').trim();
          continue;
        }
        if (/^Hint:/i.test(trimmed)) {
          currentSection = 'hint';
          hint = trimmed.replace(/^Hint:/i, '').trim();
          continue;
        }
        if (/^Explanation:/i.test(trimmed)) {
          currentSection = 'explanation';
          explanation = trimmed.replace(/^Explanation:/i, '').trim();
          continue;
        }
        if (/^Tags:/i.test(trimmed)) {
          const tagString = trimmed.replace(/^Tags:/i, '').trim();
          tags = tagString
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
          continue;
        }

        // Append to current section
        if (currentSection === 'prompt') {
          prompt += ' ' + trimmed;
        } else if (currentSection === 'response') {
          response += ' ' + trimmed;
        } else if (currentSection === 'hint') {
          hint += ' ' + trimmed;
        } else if (currentSection === 'explanation') {
          explanation += ' ' + trimmed;
        }
      }

      // Only add card if both prompt and response exist
      if (prompt && response) {
        cards.push({
          type: 'basic',
          prompt: { text: prompt.trim() },
          response: { text: response.trim() },
          hint: hint.trim() || undefined,
          explanation: explanation.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
      }
    }

    if (cards.length === 0) {
      return {
        success: false,
        error: 'No valid cards found in Markdown file',
      };
    }

    return { success: true, cards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Markdown parse error',
    };
  }
}

/**
 * Parse JSON file
 * Expected format:
 * {
 *   "cards": [
 *     {
 *       "prompt": { "text": "Question" },
 *       "response": { "text": "Answer" },
 *       "tags": ["tag1"]
 *     }
 *   ]
 * }
 */
function parseJsonFile(content: string): ParseResult {
  try {
    const data = JSON.parse(content);

    if (!data.cards || !Array.isArray(data.cards)) {
      return {
        success: false,
        error: 'JSON must contain a "cards" array',
      };
    }

    const cards: BulkCardData[] = data.cards.map((card: any) => ({
      type: card.type || 'basic',
      prompt: card.prompt || { text: card.question || '' },
      response: card.response || { text: card.answer || '' },
      hint: card.hint,
      explanation: card.explanation,
      tags: card.tags,
    }));

    return { success: true, cards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'JSON parse error',
    };
  }
}

/**
 * Parse CSV file
 * Expected columns: question,answer,hint,explanation,tags
 */
function parseCsvFile(content: string): ParseResult {
  try {
    const lines = content.split('\n').filter(l => l.trim());

    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV must have at least a header row and one data row',
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const cards: BulkCardData[] = [];

    const questionIdx = headers.findIndex(
      h => h === 'question' || h === 'prompt'
    );
    const answerIdx = headers.findIndex(
      h => h === 'answer' || h === 'response'
    );
    const hintIdx = headers.indexOf('hint');
    const explanationIdx = headers.indexOf('explanation');
    const tagsIdx = headers.indexOf('tags');

    if (questionIdx === -1 || answerIdx === -1) {
      return {
        success: false,
        error: 'CSV must have "question" and "answer" columns',
      };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());

      const question = values[questionIdx] || '';
      const answer = values[answerIdx] || '';

      if (question && answer) {
        cards.push({
          type: 'basic',
          prompt: { text: question },
          response: { text: answer },
          hint: hintIdx >= 0 ? values[hintIdx] : undefined,
          explanation: explanationIdx >= 0 ? values[explanationIdx] : undefined,
          tags:
            tagsIdx >= 0 && values[tagsIdx]
              ? values[tagsIdx].split(';').map(t => t.trim())
              : undefined,
        });
      }
    }

    return { success: true, cards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CSV parse error',
    };
  }
}

/**
 * Parse YAML file
 * Expected format:
 * cards:
 *   - prompt:
 *       text: "Question"
 *     response:
 *       text: "Answer"
 *     tags: ["tag1"]
 */
function parseYamlFile(content: string): ParseResult {
  try {
    // Simple YAML parser for basic card structure
    // Note: In production, consider using a proper YAML library
    const lines = content.split('\n');
    const cards: BulkCardData[] = [];
    let currentCard: any = null;
    let currentField: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty or comment lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      // New card indicator
      if (trimmed === '- prompt:' || trimmed.startsWith('- ')) {
        if (currentCard && currentCard.prompt && currentCard.response) {
          cards.push({
            type: currentCard.type || 'basic',
            prompt: currentCard.prompt,
            response: currentCard.response,
            hint: currentCard.hint,
            explanation: currentCard.explanation,
            tags: currentCard.tags,
          });
        }
        currentCard = {};
        currentField = 'prompt';
        continue;
      }

      // Field detectors
      if (trimmed.startsWith('prompt:')) {
        currentField = 'prompt';
        currentCard.prompt = {};
        continue;
      }
      if (trimmed.startsWith('response:')) {
        currentField = 'response';
        currentCard.response = {};
        continue;
      }
      if (trimmed.startsWith('text:')) {
        const text = trimmed
          .replace('text:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        if (currentField === 'prompt' && currentCard.prompt) {
          currentCard.prompt.text = text;
        } else if (currentField === 'response' && currentCard.response) {
          currentCard.response.text = text;
        }
        continue;
      }
      if (trimmed.startsWith('hint:')) {
        currentCard.hint = trimmed
          .replace('hint:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        continue;
      }
      if (trimmed.startsWith('explanation:')) {
        currentCard.explanation = trimmed
          .replace('explanation:', '')
          .trim()
          .replace(/^["']|["']$/g, '');
        continue;
      }
      if (trimmed.startsWith('tags:')) {
        const tagString = trimmed.replace('tags:', '').trim();
        currentCard.tags = JSON.parse(tagString.replace(/'/g, '"'));
        continue;
      }
    }

    // Add last card
    if (currentCard && currentCard.prompt && currentCard.response) {
      cards.push({
        type: currentCard.type || 'basic',
        prompt: currentCard.prompt,
        response: currentCard.response,
        hint: currentCard.hint,
        explanation: currentCard.explanation,
        tags: currentCard.tags,
      });
    }

    if (cards.length === 0) {
      return {
        success: false,
        error: 'No valid cards found in YAML file',
      };
    }

    return { success: true, cards };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'YAML parse error',
    };
  }
}
