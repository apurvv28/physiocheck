'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, ThumbsUp, ThumbsDown, MessageSquare,
  TrendingUp, Target, Clock, Award,
  Send, Smile, Frown, Meh
} from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { cn } from '@/lib/utils'

interface ExerciseFeedbackProps {
  exerciseId: string
  exerciseName: string
  sessionId?: string
  onSubmitFeedback?: (feedback: FeedbackData) => Promise<void>
  existingFeedback?: FeedbackData
  className?: string
}

interface FeedbackData {
  rating: number
  difficulty: 'too_easy' | 'just_right' | 'too_hard'
  painLevel: 0 | 1 | 2 | 3 | 4 | 5
  comments: string
  suggestions?: string
  completed: boolean
}

export function ExerciseFeedback({ 
  exerciseId, 
  exerciseName, 
  sessionId,
  onSubmitFeedback,
  existingFeedback,
  className 
}: ExerciseFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackData>(existingFeedback || {
    rating: 0,
    difficulty: 'just_right',
    painLevel: 0,
    comments: '',
    suggestions: '',
    completed: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleRatingChange = (rating: number) => {
    setFeedback({ ...feedback, rating })
  }

  const handleDifficultyChange = (difficulty: 'too_easy' | 'just_right' | 'too_hard') => {
    setFeedback({ ...feedback, difficulty })
  }

  const handlePainLevelChange = (level: 0 | 1 | 2 | 3 | 4 | 5) => {
    setFeedback({ ...feedback, painLevel: level })
  }

  const handleSubmit = async () => {
    if (!feedback.comments.trim()) return

    setIsSubmitting(true)
    try {
      if (onSubmitFeedback) {
        await onSubmitFeedback(feedback)
      }
      setIsSubmitted(true)
      
      // Reset form after submission
      setTimeout(() => {
        setFeedback({
          rating: 0,
          difficulty: 'just_right',
          painLevel: 0,
          comments: '',
          suggestions: '',
          completed: true
        })
        setIsSubmitted(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const painLevelLabels = [
    'No pain',
    'Mild discomfort',
    'Moderate pain',
    'Significant pain',
    'Severe pain',
    'Unbearable pain'
  ]

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Exercise Feedback
          </h2>
          <p className="text-slate-600 mb-6">
            Share your experience with {exerciseName}
          </p>

          {/* Rating */}
          <div className="mb-8">
            <h3 className="font-medium text-slate-900 mb-4">
              How would you rate this exercise?
            </h3>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="p-2 hover:scale-110 transition-transform duration-200"
                >
                  <Star
                    className={cn(
                      "w-8 h-8",
                      star <= feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {feedback.rating === 0 ? 'Select a rating' : `${feedback.rating} out of 5 stars`}
            </p>
          </div>

          {/* Difficulty */}
          <div className="mb-8">
            <h3 className="font-medium text-slate-900 mb-4">
              How was the difficulty level?
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'too_easy', label: 'Too Easy', icon: <Smile className="w-6 h-6" /> },
                { value: 'just_right', label: 'Just Right', icon: <Meh className="w-6 h-6" /> },
                { value: 'too_hard', label: 'Too Hard', icon: <Frown className="w-6 h-6" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDifficultyChange(option.value as FeedbackData['difficulty'])}
                  className={cn(
                    "p-4 rounded-lg border-2 flex flex-col items-center transition-all duration-200",
                    feedback.difficulty === option.value
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "mb-2",
                    feedback.difficulty === option.value ? "text-teal-600" : "text-slate-400"
                  )}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain Level */}
          <div className="mb-8">
            <h3 className="font-medium text-slate-900 mb-4">
              Pain level during exercise
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handlePainLevelChange(level as FeedbackData['painLevel'])}
                    className={cn(
                      "py-3 rounded-lg flex flex-col items-center transition-all duration-200",
                      feedback.painLevel === level
                        ? level <= 2 ? "bg-green-100 border-2 border-green-500" :
                          level <= 4 ? "bg-coral-100 border-2 border-coral-500" :
                          "bg-red-100 border-2 border-red-500"
                        : "bg-slate-100 hover:bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "text-lg font-bold mb-1",
                      level <= 2 ? "text-green-700" :
                      level <= 4 ? "text-coral-700" : "text-red-700"
                    )}>
                      {level}
                    </div>
                  </button>
                ))}
              </div>
              <div className="text-center">
                <p className={cn(
                  "font-medium",
                  feedback.painLevel <= 2 ? "text-green-600" :
                  feedback.painLevel <= 4 ? "text-coral-600" : "text-red-600"
                )}>
                  {painLevelLabels[feedback.painLevel]}
                </p>
                {feedback.painLevel >= 3 && (
                  <p className="text-sm text-coral-600 mt-1">
                    Please inform your doctor about any significant pain
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="mb-6">
            <h3 className="font-medium text-slate-900 mb-4">
              Comments & Suggestions
            </h3>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Share your experience, what worked well, and what could be improved..."
            />
          </div>

          {/* Suggestions */}
          <div className="mb-8">
            <h3 className="font-medium text-slate-900 mb-4">
              Any suggestions for your doctor?
            </h3>
            <textarea
              value={feedback.suggestions}
              onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="E.g., Adjust difficulty, modify exercise, schedule follow-up..."
            />
          </div>

          {/* Completion Status */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="completed"
                checked={feedback.completed}
                onChange={(e) => setFeedback({ ...feedback, completed: e.target.checked })}
                className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="completed" className="text-slate-700">
                I completed this exercise session
              </label>
            </div>
            {!feedback.completed && (
              <p className="text-sm text-coral-600 mt-2 ml-8">
                Please let your doctor know why you couldn't complete the exercise
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !feedback.comments.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200",
                isSubmitted
                  ? "bg-green-600 text-white"
                  : "bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : isSubmitted ? (
                <>
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Thank You!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Statistics Card */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Your Progress</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                12
              </div>
              <div className="text-sm text-blue-700">Sessions</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                94%
              </div>
              <div className="text-sm text-green-700">Completion</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                4.2
              </div>
              <div className="text-sm text-purple-700">Avg Rating</div>
            </div>
            
            <div className="text-center p-4 bg-coral-50 rounded-lg">
              <div className="text-2xl font-bold text-coral-600 mb-1">
                1.2
              </div>
              <div className="text-sm text-coral-700">Avg Pain</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Encouragement Message */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="bg-linear-to-r from-green-50 to-teal-50">
            <div className="p-6">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Thank You for Your Feedback!
              </h3>
              <p className="text-green-700">
                Your feedback helps us improve your rehabilitation program and provide better care.
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}