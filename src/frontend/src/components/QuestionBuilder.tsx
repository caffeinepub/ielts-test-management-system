import { X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuestionFormData } from '../hooks/useTestForm';

interface QuestionBuilderProps {
  question: QuestionFormData;
  index: number;
  testType: string;
  onChange: (question: QuestionFormData) => void;
  onRemove: () => void;
}

export default function QuestionBuilder({ question, index, testType, onChange, onRemove }: QuestionBuilderProps) {
  const updateField = (field: keyof QuestionFormData, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const addOption = () => {
    onChange({ ...question, options: [...question.options, ''] });
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    onChange({ ...question, options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    const newOptions = question.options.filter((_, idx) => idx !== optionIndex);
    onChange({ ...question, options: newOptions });
  };

  const availableQuestionTypes = testType === 'writing'
    ? [{ value: 'longAnswer', label: 'Long Answer' }]
    : [
        { value: 'multipleChoice', label: 'Multiple Choice' },
        { value: 'trueFalseNotGiven', label: 'True / False / Not Given' },
        { value: 'shortAnswer', label: 'Short Answer' },
        { value: 'matching', label: 'Matching' },
        { value: 'sentenceCompletion', label: 'Sentence Completion' },
      ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Question {index + 1}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={question.questionType} onValueChange={(value) => updateField('questionType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableQuestionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Marks</Label>
            <Input
              type="number"
              min="1"
              value={question.marks}
              onChange={(e) => updateField('marks', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={question.text}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Enter the question..."
            rows={3}
          />
        </div>

        {question.questionType === 'multipleChoice' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button type="button" onClick={addOption} variant="outline" size="sm">
                <Plus className="mr-1 h-3 w-3" />
                Add Option
              </Button>
            </div>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(optionIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {question.questionType !== 'longAnswer' && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Input
              value={question.correctAnswer}
              onChange={(e) => updateField('correctAnswer', e.target.value)}
              placeholder="Enter the correct answer..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
