import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import TestQuestionDisplay from './TestQuestionDisplay';
import type { Question } from '../backend';

interface ReadingTestLayoutProps {
  passage: string;
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
}

export default function ReadingTestLayout({
  passage,
  questions,
  answers,
  onAnswerChange,
}: ReadingTestLayoutProps) {
  return (
    <div className="grid h-full gap-4 lg:grid-cols-2">
      {/* Left Panel - Passage */}
      <Card className="flex h-full flex-col overflow-hidden">
        <CardContent className="flex h-full flex-col p-6">
          <h3 className="mb-4 flex-shrink-0 text-lg font-semibold">Reading Passage</h3>
          <ScrollArea className="flex-1">
            <div className="whitespace-pre-wrap pr-4 text-sm leading-relaxed">{passage}</div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Panel - All Questions */}
      <Card className="flex h-full flex-col overflow-hidden">
        <CardContent className="flex h-full flex-col p-6">
          <h3 className="mb-4 flex-shrink-0 text-lg font-semibold">Questions</h3>
          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
              {questions.map((question, index) => (
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
                        onAnswerChange={(answer) => onAnswerChange(question.id.toString(), answer)}
                      />
                    </div>
                  </div>
                  {index < questions.length - 1 && (
                    <div className="border-t border-border pt-6" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
