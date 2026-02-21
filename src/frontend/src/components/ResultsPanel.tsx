import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Eye, EyeOff, Home } from 'lucide-react';
import type { StudentResponse, Test } from '../backend';

interface ResultsPanelProps {
  response: StudentResponse;
  test: Test;
  onBackToWelcome: () => void;
}

export default function ResultsPanel({ response, test, onBackToWelcome }: ResultsPanelProps) {
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

  const totalQuestions = test.questions.filter(
    (q) => q.questionType !== 'longAnswer'
  ).length;
  const accuracy = totalQuestions > 0 ? (Number(response.totalCorrect) / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600';
    if (band >= 7) return 'text-blue-600';
    if (band >= 6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="mt-1 text-2xl font-bold">
                {response.totalScore.toString()}/{test.questions.reduce((sum, q) => sum + Number(q.marks), 0)}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">IELTS Band</p>
              <p className={`mt-1 text-2xl font-bold ${getBandColor(response.estimatedBand)}`}>
                {response.estimatedBand.toFixed(1)}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="mt-1 text-2xl font-bold">{accuracy.toFixed(1)}%</p>
            </div>

            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Time Taken</p>
              <p className="mt-1 text-2xl font-bold">{formatTime(Number(response.timeTaken))}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm">
                <span className="font-semibold">{response.totalCorrect.toString()}</span> Correct
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm">
                <span className="font-semibold">{response.totalWrong.toString()}</span> Wrong
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}>
              {showCorrectAnswers ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showCorrectAnswers ? 'Hide' : 'Show'} Correct Answers
            </Button>
            <Button onClick={onBackToWelcome}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answer Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {test.questions.map((question, index) => {
            const studentAnswer = response.answers.find((a) => a.questionId === question.id);
            const isCorrect =
              question.questionType !== 'longAnswer' &&
              studentAnswer?.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
            const isLongAnswer = question.questionType === 'longAnswer';

            return (
              <div key={question.id.toString()}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {index + 1}. {question.text}
                    </p>
                    {!isLongAnswer && (
                      <Badge variant={isCorrect ? 'default' : 'destructive'} className="shrink-0">
                        {isCorrect ? 'Correct' : 'Wrong'}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <div className={`${isLongAnswer ? '' : isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Your Answer:</p>
                      <p className="mt-1 text-sm">{studentAnswer?.answer || '(No answer provided)'}</p>
                    </div>

                    {showCorrectAnswers && !isLongAnswer && (
                      <div className="text-green-700">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Correct Answer:</p>
                        <p className="mt-1 text-sm">{question.correctAnswer}</p>
                      </div>
                    )}

                    {isLongAnswer && (
                      <p className="text-xs italic text-muted-foreground">
                        Long answer questions are not automatically scored
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
