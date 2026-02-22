import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentRegistrationModal from './StudentRegistrationModal';
import TestQuestionDisplay from './TestQuestionDisplay';
import ReadingTestLayout from './ReadingTestLayout';
import { useTestTimer } from '../hooks/useTestTimer';
import { useTestSubmission } from '../hooks/useTestSubmission';
import { useFullscreen } from '../hooks/useFullscreen';
import type { Test, Answer } from '../backend';
import { Clock, Eye, EyeOff, ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';

interface TestInterfaceProps {
  test: Test;
  onComplete: (response: any) => void;
}

export default function TestInterface({ test, onComplete }: TestInterfaceProps) {
  const [studentInfo, setStudentInfo] = useState<{ name: string; batch: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showTimer, setShowTimer] = useState(true);
  const { formattedTime, elapsedSeconds, startTimer } = useTestTimer();
  const { submitTest, isSubmitting } = useTestSubmission();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  const handleRegistrationComplete = (name: string, batch: string) => {
    setStudentInfo({ name, batch });
    startTimer();
    // Automatically enter fullscreen when test starts
    enterFullscreen();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!studentInfo) return;

    const answersArray: Answer[] = test.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id.toString()] || '',
    }));

    const response = await submitTest(test, answersArray, studentInfo.name, studentInfo.batch, elapsedSeconds);
    onComplete(response);
  };

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const isReadingTest = test.testType === 'reading';

  if (!studentInfo) {
    return <StudentRegistrationModal onComplete={handleRegistrationComplete} />;
  }

  return (
    <div className="space-y-4">
      {/* Exit Fullscreen Button */}
      {isFullscreen && (
        <div className="fixed right-4 top-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={exitFullscreen}
            className="bg-background shadow-lg"
          >
            <Minimize2 className="mr-2 h-4 w-4" />
            Exit Fullscreen
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{test.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Student: {studentInfo.name} | Batch: {studentInfo.batch}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimer(!showTimer)}
              >
                {showTimer ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                {showTimer ? 'Hide' : 'Show'} Timer
              </Button>
              {showTimer && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isReadingTest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{test.instructions}</p>
          </CardContent>
        </Card>
      )}

      {isReadingTest ? (
        <ReadingTestLayout
          passage={test.instructions}
          questions={test.questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </CardTitle>
              <Badge>{currentQuestion.marks.toString()} mark{currentQuestion.marks !== BigInt(1) ? 's' : ''}</Badge>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <TestQuestionDisplay
              question={currentQuestion}
              answer={answers[currentQuestion.id.toString()] || ''}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id.toString(), answer)}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(test.questions.length - 1, prev + 1))}
            disabled={currentQuestionIndex === test.questions.length - 1}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
        </Button>
      </div>
    </div>
  );
}
