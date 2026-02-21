import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileDown } from 'lucide-react';
import type { StudentResponse, Test } from '../backend';

interface ResponseDetailsPanelProps {
  response: StudentResponse;
  test: Test | null;
  onClose: () => void;
}

export default function ResponseDetailsPanel({ response, test, onClose }: ResponseDetailsPanelProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

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

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here using a library like jsPDF');
  };

  if (!test) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Test data not found</p>
          <Button onClick={onClose} className="mt-4">
            Back to Responses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Responses
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Student Name</p>
              <p className="mt-1 font-medium">{response.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Batch Number</p>
              <p className="mt-1 font-medium">{response.batchNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Test Name</p>
              <p className="mt-1 font-medium">{test.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submission Date</p>
              <p className="mt-1 font-medium">{formatDate(response.submissionTimestamp)}</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="mt-1 text-xl font-bold">{response.totalScore.toString()}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">IELTS Band</p>
              <p className={`mt-1 text-xl font-bold ${getBandColor(response.estimatedBand)}`}>
                {response.estimatedBand.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Correct</p>
              <p className="mt-1 text-xl font-bold text-green-600">{response.totalCorrect.toString()}</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Wrong</p>
              <p className="mt-1 text-xl font-bold text-red-600">{response.totalWrong.toString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Answer Sheet</CardTitle>
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
                      <p className="text-xs font-medium uppercase text-muted-foreground">Student Answer:</p>
                      <p className="mt-1 text-sm">{studentAnswer?.answer || '(No answer provided)'}</p>
                    </div>

                    {!isLongAnswer && (
                      <div className="text-green-700">
                        <p className="text-xs font-medium uppercase text-muted-foreground">Correct Answer:</p>
                        <p className="mt-1 text-sm">{question.correctAnswer}</p>
                      </div>
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
