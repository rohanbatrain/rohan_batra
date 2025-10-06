'use client';

import { useState, useEffect, useCallback } from 'react';

interface QuizQuestion {
  questionId: string;
  type: 'single_choice' | 'multiple_choice' | 'free_text';
  prompt: string;
  options?: Array<{ value: string; label: string }>;
  correctAnswers: string[];
  explanation?: string;
}

interface QuizProps {
  lessonId: string;
  courseId: string;
  quizData: {
    title: string;
    passingScore: number;
    timeLimitSeconds?: number;
    attemptLimit?: number;
    questions: QuizQuestion[];
  };
}

export default function QuizTaker({ lessonId, courseId, quizData }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showCorrectness, setShowCorrectness] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quizData.timeLimitSeconds || null
  );
  const [reviewMode, setReviewMode] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining((t) => (t && t > 0 ? t - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(answer)) {
          return { ...prev, [questionId]: current.filter((a) => a !== answer) };
        } else {
          return { ...prev, [questionId]: [...current, answer] };
        }
      } else {
        return { ...prev, [questionId]: [answer] };
      }
    });
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    setShowCorrectness(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setShowExplanation(false);
      setShowCorrectness(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
      setShowExplanation(false);
      setShowCorrectness(answeredQuestions.has(currentQuestionIndex - 1));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((q) => {
      const userAnswers = answers[q.questionId] || [];
      const correctAnswers = q.correctAnswers;

      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((a) => correctAnswers.includes(a))
      ) {
        correct++;
      }
    });

    return Math.round((correct / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);

    // Submit to API
    try {
      await fetch(`/api/courses/${courseId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAttempts: [
            {
              lessonId,
              score: finalScore,
              totalQuestions,
              passed: finalScore >= quizData.passingScore,
              attemptedAt: new Date().toISOString(),
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
    }
  };

  const isQuestionAnswered = (questionId: string) => {
    return (answers[questionId] || []).length > 0;
  };

  const isCorrect = (questionId: string) => {
    const userAnswers = answers[questionId] || [];
    const correctAnswers =
      quizData.questions.find((q) => q.questionId === questionId)?.correctAnswers || [];

    return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every((a) => correctAnswers.includes(a))
    );
  };

  if (isSubmitted && score !== null) {
    const passed = score >= quizData.passingScore;

    return (
      <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
        <div className='text-center'>
          <div
            className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ${
              passed
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {passed ? (
              <svg className='h-10 w-10' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg className='h-10 w-10' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            )}
          </div>

          <h2 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            {passed ? 'Quiz Passed!' : 'Quiz Failed'}
          </h2>

          <div className='mb-6'>
            <div className='text-5xl font-bold text-gray-900 dark:text-white'>{score}%</div>
            <div className='text-sm text-gray-600 dark:text-gray-400'>
              {quizData.questions.filter((q) => isCorrect(q.questionId)).length} out of{' '}
              {totalQuestions} correct
            </div>
            <div className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Passing score: {quizData.passingScore}%
            </div>
          </div>

          {passed ? (
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Congratulations! You've successfully passed this quiz.
            </p>
          ) : (
            <p className='mb-6 text-gray-600 dark:text-gray-400'>
              Don't worry! Review the material and try again.
            </p>
          )}

          <button
            onClick={() => {
              setIsSubmitted(false);
              setScore(null);
              setAnswers({});
              setCurrentQuestionIndex(0);
              setShowExplanation(false);
              setAnsweredQuestions(new Set());
              setShowCorrectness(false);
              setTimeRemaining(quizData.timeLimitSeconds || null);
              setReviewMode(false);
            }}
            className='mr-3 rounded-lg border border-blue-600 bg-white px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors'
          >
            Retake Quiz
          </button>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setReviewMode(true);
              setCurrentQuestionIndex(0);
            }}
            className='rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
          >
            Review Answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      {/* Timer */}
      {timeRemaining !== null && !isSubmitted && (
        <div className='mb-6 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20'>
          <div className='flex items-center gap-2'>
            <svg className='h-5 w-5 text-orange-600 dark:text-orange-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            <span className='text-sm font-medium text-orange-900 dark:text-orange-200'>
              Time Remaining
            </span>
          </div>
          <span className={`text-lg font-bold ${timeRemaining < 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-900 dark:text-orange-200'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className='mb-6'>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium text-gray-700 dark:text-gray-300'>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className='text-gray-500 dark:text-gray-400'>
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='h-full bg-blue-600 transition-all duration-300'
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className='mb-6'>
        <h3 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          {currentQuestion.prompt}
        </h3>

        {/* Single/Multiple Choice */}
        {(currentQuestion.type === 'single_choice' ||
          currentQuestion.type === 'multiple_choice') && (
          <div className='space-y-3'>
            {currentQuestion.options?.map((option) => {
              const isSelected = (answers[currentQuestion.questionId] || []).includes(
                option.value
              );
              const isCorrectOption = currentQuestion.correctAnswers?.includes(option.value);
              const showFeedback = showCorrectness && isSelected;

              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                    showFeedback && isCorrectOption
                      ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                      : showFeedback && !isCorrectOption
                        ? 'border-red-500 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type={currentQuestion.type === 'single_choice' ? 'radio' : 'checkbox'}
                    name={currentQuestion.questionId}
                    value={option.value}
                    checked={isSelected}
                    onChange={() =>
                      handleAnswer(
                        currentQuestion.questionId,
                        option.value,
                        currentQuestion.type === 'multiple_choice'
                      )
                    }
                    className='h-4 w-4 text-blue-600'
                    disabled={reviewMode}
                  />
                  <span className='flex-1 text-gray-900 dark:text-white'>{option.label}</span>
                  {showFeedback && isCorrectOption && (
                    <svg className='h-5 w-5 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  )}
                  {showFeedback && !isCorrectOption && (
                    <svg className='h-5 w-5 text-red-600 dark:text-red-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
        )}

        {/* Free Text */}
        {currentQuestion.type === 'free_text' && (
          <textarea
            value={(answers[currentQuestion.questionId] || [])[0] || ''}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [currentQuestion.questionId]: [e.target.value],
              }))
            }
            rows={4}
            className='w-full rounded-lg border border-gray-300 bg-white p-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-600 dark:focus:ring-blue-600'
            placeholder='Type your answer here...'
          />
        )}
      </div>

      {/* Explanation (show after answering or in review mode) */}
      {(showExplanation || (reviewMode && showCorrectness)) && currentQuestion.explanation && (
        <div className={`mb-6 rounded-lg border p-4 ${
          showCorrectness && answeredQuestions.has(currentQuestionIndex)
            ? isCorrect(currentQuestion.questionId)
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
        }`}>
          <div className='mb-2 flex items-center gap-2'>
            <svg
              className={`h-5 w-5 ${
                showCorrectness && answeredQuestions.has(currentQuestionIndex)
                  ? isCorrect(currentQuestion.questionId)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span className={`font-semibold ${
              showCorrectness && answeredQuestions.has(currentQuestionIndex)
                ? isCorrect(currentQuestion.questionId)
                  ? 'text-green-900 dark:text-green-200'
                  : 'text-red-900 dark:text-red-200'
                : 'text-blue-900 dark:text-blue-200'
            }`}>
              {showCorrectness && answeredQuestions.has(currentQuestionIndex)
                ? isCorrect(currentQuestion.questionId) ? 'Correct!' : 'Incorrect'
                : 'Explanation'}
            </span>
          </div>
          <p className={`text-sm ${
            showCorrectness && answeredQuestions.has(currentQuestionIndex)
              ? isCorrect(currentQuestion.questionId)
                ? 'text-green-800 dark:text-green-300'
                : 'text-red-800 dark:text-red-300'
              : 'text-blue-800 dark:text-blue-300'
          }`}>
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Question Navigation Grid (in review mode) */}
      {reviewMode && (
        <div className='mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
          <h4 className='mb-3 text-sm font-semibold text-gray-900 dark:text-white'>Question Navigator</h4>
          <div className='grid grid-cols-8 gap-2'>
            {quizData.questions.map((_, index) => {
              const isAnswered = answeredQuestions.has(index);
              const isCurrent = index === currentQuestionIndex;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setShowCorrectness(isAnswered);
                    setShowExplanation(false);
                  }}
                  className={`aspect-square rounded-lg border text-sm font-medium transition-all ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                      : isAnswered
                        ? 'border-green-300 bg-green-100 text-green-700 hover:bg-green-200 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className='flex items-center justify-between gap-4'>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors'
        >
          ← Previous
        </button>

        <div className='flex items-center gap-2'>
          {/* Answered indicator */}
          {!reviewMode && answeredQuestions.has(currentQuestionIndex) && (
            <div className='flex items-center gap-1 text-xs text-green-600 dark:text-green-400'>
              <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
              <span>Answered</span>
            </div>
          )}
          
          {!reviewMode && isQuestionAnswered(currentQuestion.questionId) &&
            currentQuestion.explanation &&
            !showExplanation && (
              <button
                onClick={() => setShowExplanation(true)}
                className='rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
              >
                💡 Explanation
              </button>
            )}

          {reviewMode ? (
            <button
              onClick={() => {
                setReviewMode(false);
                setShowCorrectness(false);
                setShowExplanation(false);
              }}
              className='rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors'
            >
              Submit Quiz
            </button>
          ) : currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== totalQuestions}
              className='rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className='rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Answer Counter */}
      <div className='mt-4 flex items-center justify-center gap-4 text-sm'>
        <div className='text-gray-600 dark:text-gray-400'>
          <span className='font-semibold text-gray-900 dark:text-white'>{answeredQuestions.size}</span> of {totalQuestions} answered
        </div>
        {!reviewMode && answeredQuestions.size === totalQuestions && (
          <button
            onClick={() => {
              setReviewMode(true);
              setCurrentQuestionIndex(0);
              setShowCorrectness(answeredQuestions.has(0));
            }}
            className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors'
          >
            Review all answers
          </button>
        )}
      </div>
    </div>
  );
}
