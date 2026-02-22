import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import TestQuestionDisplay from './TestQuestionDisplay';
import type { Question } from '../backend';

interface ReadingTestLayoutProps {
  passage: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export default function ReadingTestLayout({
  passage,
  questions,
  currentQuestionIndex,
  answers,
  onAnswerChange,
}: ReadingTestLayoutProps) {
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="grid h-[600px] gap-4 lg:grid-cols-2">
      {/* Left Panel - Passage */}
      <Card className="flex flex-col">
        <CardContent className="flex-1 p-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reading Passage</h3>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{passage}</div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - Questions */}
      <Card className="flex flex-col">
        <CardContent className="flex-1 p-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.marks.toString()} mark{currentQuestion.marks !== BigInt(1) ? 's' : ''}
                </span>
              </div>
              <TestQuestionDisplay
                question={currentQuestion}
                answer={answers[currentQuestion.id.toString()] || ''}
                onAnswerChange={(answer) => onAnswerChange(currentQuestion.id.toString(), answer)}
              />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
