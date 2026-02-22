import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import StudentRegistrationModal from './StudentRegistrationModal';
import TestQuestionDisplay from './TestQuestionDisplay';
import ReadingTestLayout from './ReadingTestLayout';
import { useTestTimer } from '../hooks/useTestTimer';
import { useTestSubmission } from '../hooks/useTestSubmission';
import { useFullscreen } from '../hooks/useFullscreen';
import type { Test, Answer } from '../backend';
import { Clock, Eye, EyeOff, Minimize2 } from 'lucide-react';

interface TestInterfaceProps {
  test: Test;
  onComplete: (response: any) => void;
}

export default function TestInterface({ test, onComplete }: TestInterfaceProps) {
  const [studentInfo, setStudentInfo] = useState<{ name: string; batch: string } | null>(null);
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

  const isReadingTest = test.testType === 'reading';
  const answeredCount = Object.keys(answers).filter(key => answers[key].trim() !== '').length;

  if (!studentInfo) {
    return <StudentRegistrationModal onComplete={handleRegistrationComplete} />;
  }

  return (
    <div className="flex h-full flex-col">
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

      {/* Header Card - Fixed */}
      <div className="flex-shrink-0 space-y-4">
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

        {/* Progress Indicator */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {answeredCount} of {test.questions.length} answered
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(answeredCount / test.questions.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden py-4">
        {isReadingTest ? (
          <ReadingTestLayout
            passage={test.instructions}
            questions={test.questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        ) : (
          <Card className="h-full">
            <ScrollArea className="h-full">
              <CardContent className="space-y-6 p-6">
                {test.questions.map((question, index) => (
                  <div key={question.id.toString()} className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-sm">
                            Question {index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.marks.toString()} mark{question.marks !== BigInt(1) ? 's' : ''}
                          </Badge>
                        </div>
                        <TestQuestionDisplay
                          question={question}
                          answer={answers[question.id.toString()] || ''}
                          onAnswerChange={(answer) => handleAnswerChange(question.id.toString(), answer)}
                        />
                      </div>
                    </div>
                    {index < test.questions.length - 1 && (
                      <div className="border-t border-border pt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Submit Button - Fixed at Bottom */}
      <div className="flex-shrink-0 border-t border-border bg-background pt-4">
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </Button>
        </div>
      </div>
    </div>
  );
}
