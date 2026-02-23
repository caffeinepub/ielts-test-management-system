import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuestionFormData } from '../hooks/useTestForm';
import { ExternalBlob, Variant_audio_image } from '../backend';

interface QuestionBuilderProps {
  question: QuestionFormData;
  index: number;
  testType: string;
  onChange: (question: QuestionFormData) => void;
  onRemove: () => void;
}

export default function QuestionBuilder({ question, index, testType, onChange, onRemove }: QuestionBuilderProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isImage && !isAudio) {
      alert('Please upload an image (PNG, JPG, JPEG, GIF) or audio file (MP3, WAV, OGG)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Read file as bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Update question with media using the correct enum
      updateField('media', {
        blob,
        mediaType: isImage ? Variant_audio_image.image : Variant_audio_image.audio,
        description: file.name,
      });

      setUploadProgress(null);
      setIsUploading(false);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file. Please try again.');
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const removeMedia = () => {
    updateField('media', null);
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

  const showFileUpload = testType === 'writing' || testType === 'listening';

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

        {/* File Upload Section for Writing and Listening */}
        {showFileUpload && (
          <div className="space-y-2">
            <Label>Attach Media (Optional)</Label>
            {question.media ? (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {question.media.mediaType === Variant_audio_image.image ? '🖼️ Image' : '🎵 Audio'}: {question.media.description}
                    </p>
                    {question.media.mediaType === Variant_audio_image.image && question.media.blob && (
                      <img
                        src={question.media.blob.getDirectURL()}
                        alt="Preview"
                        className="mt-2 max-h-32 rounded object-contain"
                      />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={removeMedia}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,audio/mp3,audio/wav,audio/ogg,audio/mpeg"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {isUploading && uploadProgress !== null && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Supported formats: PNG, JPG, JPEG, GIF, MP3, WAV, OGG
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Question Text</Label>
          <Textarea
            value={question.text}
            onChange={(e) => updateField('text', e.target.value)}
            placeholder="Enter the question..."
            rows={3}
          />
        </div>

        {(question.questionType === 'multipleChoice' || question.questionType === 'matching') && (
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
