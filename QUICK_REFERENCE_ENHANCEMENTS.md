# 🚀 Quick Reference: Enhanced Course Features

## 🎯 Quiz System Quick Guide

### Key Features at a Glance
```typescript
// Timer (Auto-enabled if timeLimitSeconds set)
⏱️ Countdown timer with auto-submit
🔴 Red pulsing in last minute
📊 MM:SS format display

// Answer Feedback (Automatic)
✅ Green border + checkmark for correct
❌ Red border + X icon for incorrect
💡 Color-coded explanations

// Review Mode (Activated when all answered)
🔍 Question grid navigator (8 columns)
🎯 Click any question to jump
📝 Shows answered/unanswered status
✨ Review before submit

// Progress Tracking
📊 Visual progress bar
🔢 X of Y answered counter
✅ Answered indicators
```

### Using Quiz Component
```tsx
import QuizTaker from '@/components/courses/QuizTaker';

<QuizTaker
  quizData={{
    quizId: 'unique-id',
    title: 'React Fundamentals Quiz',
    description: 'Test your React knowledge',
    passingScore: 70,
    timeLimitSeconds: 1800, // 30 minutes (optional)
    questions: [
      {
        questionId: 'q1',
        type: 'single_choice',
        prompt: 'What is React?',
        options: [
          { value: 'a', label: 'A library' },
          { value: 'b', label: 'A framework' },
        ],
        correctAnswers: ['a'],
        explanation: 'React is a JavaScript library',
      },
      // ... more questions
    ],
  }}
  courseId="course-123"
  lessonId="lesson-456"
/>
```

### Quiz State Flow
```
Start → Timer Running → Answer Questions → See Feedback
                                    ↓
                        All Answered → Review Mode
                                    ↓
                              Submit → Results
```

---

## 🎴 Flashcard System Quick Guide

### Key Features at a Glance
```typescript
// Study Modes
📚 All Cards - Complete deck
🔥 Difficult - Only hard/medium cards
📝 Not Reviewed - Unreviewed only

// Options
🔀 Shuffle - Randomize order
⚡ Auto-Advance - Progress automatically
🔄 Reset - Start fresh

// Rating System
😊 Easy - Green
😐 Medium - Yellow
😰 Hard - Red

// Visual Design
🎨 Blue gradient (front)
💜 Purple gradient (back)
✨ 3D flip animation
🔄 Flip hint on hover
```

### Using Flashcard Component
```tsx
import FlashcardReviewer from '@/components/courses/FlashcardReviewer';

<FlashcardReviewer
  deckId="deck-123"
  deckTitle="React Concepts"
  cards={[
    {
      id: 'card-1',
      type: 'basic',
      prompt: {
        text: 'What is JSX?',
      },
      response: {
        text: 'JavaScript XML - syntax extension',
      },
      hint: 'Think about mixing JS and HTML',
      explanation: 'JSX allows HTML-like syntax in JS',
      tags: ['jsx', 'basics'],
    },
    // ... more cards
  ]}
/>
```

### Flashcard State Flow
```
Open Settings → Choose Mode → Study Cards → Rate Difficulty
                                              ↓
                                    Auto-Advance (optional)
                                              ↓
                                Complete → Study Difficult (optional)
```

---

## ⌨️ Keyboard Shortcuts

### Quiz
```
Tab         Navigate between elements
Enter       Submit/Continue
Space       (No shortcuts - reserved for text input)
```

### Flashcards
```
←           Previous card
→           Next card
Space       Flip card
Tab         Navigate elements
```

---

## 🎨 Customization Points

### Quiz Colors
```typescript
// In QuizTaker.tsx
Timer Warning:    'text-orange-600'
Timer Critical:   'text-red-600 animate-pulse'
Correct:          'border-green-500 bg-green-50'
Incorrect:        'border-red-500 bg-red-50'
Review Mode:      'bg-blue-600' (current)
                  'bg-green-100' (answered)
```

### Flashcard Colors
```typescript
// In FlashcardReviewer.tsx
Card Front:       'from-white to-blue-50'
Card Back:        'from-purple-50 via-blue-50 to-indigo-50'
Easy Button:      'border-green-500 bg-green-100'
Medium Button:    'border-yellow-500 bg-yellow-100'
Hard Button:      'border-red-500 bg-red-100'
```

### Animation Timings
```typescript
// Adjust in component styles
Card Flip:        'duration-500' (500ms)
Button Hover:     'transition-colors' (200ms default)
Progress Bar:     'duration-300' (300ms)
Auto-Advance:     setTimeout(300) in handleDifficulty
```

---

## 🔧 Configuration Options

### Quiz Configuration
```typescript
interface QuizData {
  quizId: string;
  title: string;
  description?: string;
  passingScore: number;              // Required: 0-100
  timeLimitSeconds?: number | null;  // Optional: null = no timer
  questions: Question[];
}
```

### Flashcard Configuration
```typescript
interface FlashcardData {
  id: string;
  type: 'basic' | 'cloze' | 'qa' | 'image';
  prompt: {
    text?: string;
    richText?: string;
    media?: { imageUrls?: string[]; audioUrl?: string };
  };
  response: {
    text?: string;
    richText?: string;
    media?: { imageUrls?: string[]; audioUrl?: string };
  };
  hint?: string;          // Optional
  explanation?: string;   // Optional
  tags?: string[];       // Optional
}
```

---

## 📊 State Management

### Quiz State
```typescript
// Core state
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState<Record<string, string[]>>({});
const [isSubmitted, setIsSubmitted] = useState(false);

// Enhancement state
const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
const [showCorrectness, setShowCorrectness] = useState(false);
const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
const [reviewMode, setReviewMode] = useState(false);
```

### Flashcard State
```typescript
// Core state
const [currentCardIndex, setCurrentCardIndex] = useState(0);
const [isFlipped, setIsFlipped] = useState(false);
const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
const [difficulty, setDifficulty] = useState<Record<number, string>>({});

// Enhancement state
const [isShuffled, setIsShuffled] = useState(false);
const [studyMode, setStudyMode] = useState<StudyMode>('all');
const [showSettings, setShowSettings] = useState(false);
const [autoAdvance, setAutoAdvance] = useState(false);
```

---

## 🐛 Common Issues & Solutions

### Quiz Issues

**Q: Timer not showing**
```typescript
A: Ensure timeLimitSeconds is set in quizData:
quizData.timeLimitSeconds = 1800; // 30 minutes
```

**Q: Feedback not appearing**
```typescript
A: Correctness shows only after answering. Check:
- answers state is being updated
- correctAnswers array is populated in question data
```

**Q: Review mode not activating**
```typescript
A: Review mode appears when:
- All questions have been answered
- User clicks "Review all answers" link
```

### Flashcard Issues

**Q: Shuffle not working**
```typescript
A: Shuffle is applied via useMemo. Check:
- isShuffled state is true
- displayCards uses the shuffled array
```

**Q: Study mode showing no cards**
```typescript
A: "Difficult" mode requires rated cards. Check:
- difficulty state has entries
- At least one card is rated hard/medium
```

**Q: Auto-advance not working**
```typescript
A: Check:
- autoAdvance state is true
- setTimeout in handleDifficulty is not blocked
- User has clicked a difficulty button
```

---

## 📱 Responsive Behavior

### Breakpoints
```typescript
// Default Tailwind breakpoints used
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large devices
```

### Mobile Optimizations
```typescript
// Quiz
- Timer stacks on narrow screens
- Question navigator wraps (grid-cols-8 → adaptive)
- Buttons stack vertically if needed

// Flashcards
- Settings panel full width
- Card height adjusts (h-96 on desktop)
- Difficulty buttons stack if narrow
- Keyboard shortcuts hide on touch devices (optional)
```

---

## 🎨 Dark Mode Classes

### Quiz
```typescript
Timer:       'dark:border-orange-800 dark:bg-orange-900/20'
Correct:     'dark:border-green-600 dark:bg-green-900/20'
Incorrect:   'dark:border-red-600 dark:bg-red-900/20'
Background:  'dark:bg-gray-900'
Text:        'dark:text-white'
```

### Flashcards
```typescript
Card Front:  'dark:from-gray-800 dark:to-gray-900'
Card Back:   'dark:from-purple-900/20 dark:via-blue-900/20'
Settings:    'dark:bg-gray-900 dark:border-gray-800'
Easy:        'dark:bg-green-900/30 dark:text-green-300'
Medium:      'dark:bg-yellow-900/30 dark:text-yellow-300'
Hard:        'dark:bg-red-900/30 dark:text-red-300'
```

---

## 🚀 Performance Tips

### Quiz Optimization
```typescript
// Memoize expensive calculations
const totalQuestions = useMemo(() => 
  quizData.questions.length, [quizData]
);

// Cleanup timer effect
useEffect(() => {
  const timer = setTimeout(...);
  return () => clearTimeout(timer);
}, [timeRemaining]);
```

### Flashcard Optimization
```typescript
// Memoize filtered cards
const displayCards = useMemo(() => {
  // Filter and shuffle logic
}, [cards, isShuffled, studyMode, difficulty, reviewedCards]);

// Prevent unnecessary re-renders
const handleDifficulty = useCallback((level) => {
  // Rating logic
}, [currentCardIndex]);
```

---

## 📝 Testing Examples

### Quiz Testing
```typescript
// Test timer functionality
it('should countdown and auto-submit', async () => {
  render(<QuizTaker {...props} />);
  // Wait for timer to reach 0
  // Verify handleSubmit was called
});

// Test answer feedback
it('should show green for correct answer', () => {
  render(<QuizTaker {...props} />);
  // Click correct answer
  // Verify green border applied
});

// Test review mode
it('should show question grid when all answered', () => {
  render(<QuizTaker {...props} />);
  // Answer all questions
  // Verify grid appears
});
```

### Flashcard Testing
```typescript
// Test shuffle
it('should randomize card order', () => {
  render(<FlashcardReviewer {...props} />);
  // Enable shuffle
  // Verify order changed
});

// Test study modes
it('should filter difficult cards', () => {
  render(<FlashcardReviewer {...props} />);
  // Rate some cards as hard
  // Switch to difficult mode
  // Verify only hard cards shown
});
```

---

## 🎯 Pro Tips

### Quiz Tips
1. Set `timeLimitSeconds` for timed quizzes
2. Add explanations to all questions for better learning
3. Use review mode to let learners verify before submit
4. Set appropriate passing scores (70-80% recommended)
5. Use multiple choice for quick assessment
6. Add hints for complex questions

### Flashcard Tips
1. Enable shuffle for varied practice
2. Use "Difficult" mode for targeted review
3. Add hints for complex concepts
4. Include explanations for deeper learning
5. Use auto-advance for speed drills
6. Tag cards for organization
7. Keep card text concise (< 100 chars ideal)

---

## 📚 Additional Resources

### Documentation Files
- `COURSE_FEATURES_ENHANCEMENTS.md` - Full technical documentation
- `ENHANCEMENTS_VISUAL_GUIDE.md` - Visual design guide
- `ENHANCEMENTS_COMPLETE_SUMMARY.md` - Executive summary

### Component Locations
- Quiz: `src/components/courses/QuizTaker.tsx`
- Flashcards: `src/components/courses/FlashcardReviewer.tsx`
- Progress: `src/components/courses/MarkCompleteButton.tsx`
- Navigation: `src/components/courses/LessonNavigation.tsx`

---

## ✅ Checklist for Implementation

### Before Deploying
- [ ] Test timer countdown and auto-submit
- [ ] Verify answer feedback colors
- [ ] Test review mode navigation
- [ ] Check flashcard shuffle
- [ ] Verify study modes filter correctly
- [ ] Test auto-advance timing
- [ ] Verify keyboard shortcuts
- [ ] Test dark mode appearance
- [ ] Check mobile responsiveness
- [ ] Verify all animations smooth
- [ ] Test with real course data
- [ ] Run TypeScript checks (0 errors)

---

**Quick Reference Last Updated**: December 2024
**Version**: 2.0 (Enhanced)
**Status**: ✅ Production Ready
