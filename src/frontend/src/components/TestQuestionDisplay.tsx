import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Question } from '../backend';

interface TestQuestionDisplayProps {
  question: Question;
  answer: string;
  onAnswerChange: (answer: string) => void;
}

export default function TestQuestionDisplay({ question, answer, onAnswerChange }: TestQuestionDisplayProps) {
  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      multipleChoice: 'Multiple Choice',
      trueFalseNotGiven: 'True / False / Not Given',
      shortAnswer: 'Short Answer',
      matching: 'Matching',
      sentenceCompletion: 'Sentence Completion',
      longAnswer: 'Long Answer',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
          {getQuestionTypeLabel(question.questionType)}
        </p>
        <p className="text-base font-medium">{question.text}</p>
      </div>

      {question.questionType === 'multipleChoice' && (
        <RadioGroup value={answer} onValueChange={onAnswerChange}>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.questionType === 'trueFalseNotGiven' && (
        <RadioGroup value={answer} onValueChange={onAnswerChange}>
          <div className="space-y-2">
            {['True', 'False', 'Not Given'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`tfng-${option}`} />
                <Label htmlFor={`tfng-${option}`} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {(question.questionType === 'shortAnswer' ||
        question.questionType === 'matching' ||
        question.questionType === 'sentenceCompletion') && (
        <Input
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
        />
      )}

      {question.questionType === 'longAnswer' && (
        <Textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={10}
          className="resize-none"
        />
      )}
    </div>
  );
}
