export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  type: 'basic' | 'cloze' | 'qa' | 'image';
  promptPlaceholder: string;
  responsePlaceholder: string;
  hintPlaceholder?: string;
  explanationPlaceholder?: string;
  suggestedTags?: string[];
}

export const cardTemplates: CardTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Card',
    description: 'Start from scratch with an empty card',
    type: 'basic',
    promptPlaceholder: '',
    responsePlaceholder: '',
    hintPlaceholder: '',
    explanationPlaceholder: '',
    suggestedTags: [],
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    description: 'Learn new words and their meanings',
    type: 'basic',
    promptPlaceholder: '<p><strong>Word:</strong> [term]</p>',
    responsePlaceholder: '<p><strong>Definition:</strong> [meaning]</p><p><strong>Example:</strong> [sentence using the word]</p>',
    hintPlaceholder: 'First letter or context',
    explanationPlaceholder: 'Etymology, synonyms, or usage notes',
    suggestedTags: ['vocabulary', 'language'],
  },
  {
    id: 'definition',
    name: 'Definition',
    description: 'Define a concept or term',
    type: 'basic',
    promptPlaceholder: '<p>What is <strong>[concept]</strong>?</p>',
    responsePlaceholder: '<p>[Concept] is [definition]</p><ul><li>Key characteristic 1</li><li>Key characteristic 2</li></ul>',
    hintPlaceholder: 'Category or domain',
    explanationPlaceholder: 'Real-world examples or applications',
    suggestedTags: ['definition', 'concept'],
  },
  {
    id: 'qa',
    name: 'Question & Answer',
    description: 'Test understanding with questions',
    type: 'qa',
    promptPlaceholder: '<p>[Question about a topic]</p>',
    responsePlaceholder: '<p><strong>Answer:</strong> [detailed answer]</p><p><strong>Explanation:</strong> [why this is the answer]</p>',
    hintPlaceholder: 'Topic or category',
    explanationPlaceholder: 'Additional context or related information',
    suggestedTags: ['question', 'test'],
  },
  {
    id: 'code-snippet',
    name: 'Code Snippet',
    description: 'Memorize programming concepts',
    type: 'qa',
    promptPlaceholder: '<p>What does this code do?</p><p><code>[code snippet]</code></p>',
    responsePlaceholder: '<p><strong>Purpose:</strong> [what it does]</p><p><strong>Output:</strong> [expected result]</p><p><strong>Key Concept:</strong> [programming concept]</p>',
    hintPlaceholder: 'Programming language or concept',
    explanationPlaceholder: 'When to use this pattern or alternative approaches',
    suggestedTags: ['programming', 'code'],
  },
  {
    id: 'cloze-deletion',
    name: 'Fill in the Blank',
    description: 'Test memory with cloze deletions',
    type: 'cloze',
    promptPlaceholder: '<p>The [...] is the powerhouse of the cell.</p>',
    responsePlaceholder: '<p>mitochondria</p>',
    hintPlaceholder: 'Category or first letter',
    explanationPlaceholder: 'Additional details about the answer',
    suggestedTags: ['cloze', 'fill-in'],
  },
  {
    id: 'formula',
    name: 'Formula',
    description: 'Learn mathematical or scientific formulas',
    type: 'basic',
    promptPlaceholder: '<p>What is the formula for <strong>[concept]</strong>?</p>',
    responsePlaceholder: '<p><strong>Formula:</strong> [equation]</p><p><strong>Where:</strong></p><ul><li>[variable] = [description]</li><li>[variable] = [description]</li></ul>',
    hintPlaceholder: 'Variables used or context',
    explanationPlaceholder: 'Derivation or practical example',
    suggestedTags: ['formula', 'math'],
  },
  {
    id: 'comparison',
    name: 'Comparison',
    description: 'Compare two concepts or items',
    type: 'basic',
    promptPlaceholder: '<p>Compare <strong>[A]</strong> and <strong>[B]</strong></p>',
    responsePlaceholder: '<p><strong>Similarities:</strong></p><ul><li>[similarity 1]</li><li>[similarity 2]</li></ul><p><strong>Differences:</strong></p><ul><li>[difference 1]</li><li>[difference 2]</li></ul>',
    hintPlaceholder: 'Category they belong to',
    explanationPlaceholder: 'When to use each or context',
    suggestedTags: ['comparison', 'contrast'],
  },
  {
    id: 'process',
    name: 'Process Steps',
    description: 'Memorize a sequence or procedure',
    type: 'qa',
    promptPlaceholder: '<p>What are the steps to <strong>[process]</strong>?</p>',
    responsePlaceholder: '<ol><li><strong>Step 1:</strong> [action]</li><li><strong>Step 2:</strong> [action]</li><li><strong>Step 3:</strong> [action]</li></ol>',
    hintPlaceholder: 'Number of steps or first step',
    explanationPlaceholder: 'Common mistakes or variations',
    suggestedTags: ['process', 'steps'],
  },
  {
    id: 'image-description',
    name: 'Image Description',
    description: 'Identify or describe an image',
    type: 'image',
    promptPlaceholder: '<p>What is shown in this image?</p>',
    responsePlaceholder: '<p><strong>Description:</strong> [what the image shows]</p><p><strong>Key Elements:</strong></p><ul><li>[element 1]</li><li>[element 2]</li></ul>',
    hintPlaceholder: 'Category or context',
    explanationPlaceholder: 'Significance or additional details',
    suggestedTags: ['image', 'visual'],
  },
];

export function getTemplateById(id: string): CardTemplate | undefined {
  return cardTemplates.find(template => template.id === id);
}

export function getTemplatesByType(type: 'basic' | 'cloze' | 'qa' | 'image'): CardTemplate[] {
  return cardTemplates.filter(template => template.type === type);
}
