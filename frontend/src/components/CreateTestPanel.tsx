import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import QuestionBuilder from './QuestionBuilder';
import { useTestForm } from '../hooks/useTestForm';
import { useCreateTest } from '../hooks/useQueries';
import { Textarea } from '@/components/ui/textarea';
import type { AuthCredentials } from '../backend';
import { toast } from 'sonner';

interface CreateTestPanelProps {
  onClose: () => void;
  credentials: AuthCredentials | null;
}

export default function CreateTestPanel({ onClose, credentials }: CreateTestPanelProps) {
  const { formState, convertToBackendTest, updateField, addQuestion, removeQuestion, updateQuestion, validateForm, resetForm } = useTestForm();
  const createTestMutation = useCreateTest();
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = async () => {
    if (!credentials) {
      setErrors(['Authentication required. Please log in again.']);
      toast.error('Authentication required');
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setErrors([]);
      const backendTest = convertToBackendTest();
      await createTestMutation.mutateAsync({ credentials, test: backendTest });
      toast.success('Test created successfully');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Test creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create test. Please try again.';
      setErrors([errorMessage]);
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Test</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {errors.length > 0 && (
              <div className="rounded-md bg-destructive/10 p-3">
                <ul className="list-inside list-disc text-sm text-destructive">
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                value={formState.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., IELTS Reading Practice Test 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testType">Test Type *</Label>
              <Select value={formState.testType} onValueChange={(value) => updateField('testType', value)}>
                <SelectTrigger id="testType">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions / Passage *</Label>
              <Textarea
                id="instructions"
                value={formState.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                placeholder="Enter test instructions or reading passage here..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions *</Label>
                <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                  Add Question
                </Button>
              </div>

              {formState.questions.map((question, index) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  index={index}
                  testType={formState.testType}
                  onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                  onRemove={() => removeQuestion(index)}
                />
              ))}

              {formState.questions.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">No questions added yet</p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createTestMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createTestMutation.isPending}>
            {createTestMutation.isPending ? 'Saving...' : 'Save Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
