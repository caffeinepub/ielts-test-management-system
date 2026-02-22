import { useState } from 'react';
import type { Test, Question, TestType, QuestionType, Variant_audio_image } from '../backend';

export interface QuestionFormData {
  id: number;
  text: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  media?: {
    blob: any;
    mediaType: Variant_audio_image;
    description: string;
  } | null;
}

interface TestFormState {
  title: string;
  testType: string;
  instructions: string;
  questions: QuestionFormData[];
}

export function useTestForm() {
  const [formState, setFormState] = useState<TestFormState>({
    title: '',
    testType: '',
    instructions: '',
    questions: [],
  });

  const updateField = (field: keyof TestFormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const newQuestion: QuestionFormData = {
      id: Date.now(),
      text: '',
      questionType: formState.testType === 'writing' ? 'longAnswer' : 'multipleChoice',
      options: [],
      correctAnswer: '',
      marks: 1,
      media: null,
    };
    setFormState((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, question: QuestionFormData) => {
    setFormState((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formState.title.trim()) {
      errors.push('Test title is required');
    }

    if (!formState.testType) {
      errors.push('Test type is required');
    }

    if (!formState.instructions.trim()) {
      errors.push('Instructions are required');
    }

    if (formState.questions.length === 0) {
      errors.push('At least one question is required');
    }

    formState.questions.forEach((q, index) => {
      if (!q.text.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }
      if (q.questionType === 'multipleChoice' && q.options.length < 2) {
        errors.push(`Question ${index + 1}: At least 2 options are required for multiple choice`);
      }
      if (q.questionType !== 'longAnswer' && !q.correctAnswer.trim()) {
        errors.push(`Question ${index + 1}: Correct answer is required`);
      }
    });

    return errors;
  };

  const resetForm = () => {
    setFormState({
      title: '',
      testType: '',
      instructions: '',
      questions: [],
    });
  };

  // Convert form state to backend Test type
  const convertToBackendTest = (): Test => {
    const testTypeMap: Record<string, TestType> = {
      listening: 'listening' as TestType,
      reading: 'reading' as TestType,
      writing: 'writing' as TestType,
      mixed: 'mixed' as TestType,
    };

    const questionTypeMap: Record<string, QuestionType> = {
      multipleChoice: 'multipleChoice' as QuestionType,
      trueFalseNotGiven: 'trueFalseNotGiven' as QuestionType,
      shortAnswer: 'shortAnswer' as QuestionType,
      matching: 'matching' as QuestionType,
      sentenceCompletion: 'sentenceCompletion' as QuestionType,
      longAnswer: 'longAnswer' as QuestionType,
    };

    return {
      id: BigInt(Date.now()),
      title: formState.title,
      testType: testTypeMap[formState.testType],
      instructions: formState.instructions,
      questions: formState.questions.map((q) => {
        const baseQuestion: Question = {
          id: BigInt(q.id),
          text: q.text,
          questionType: questionTypeMap[q.questionType],
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: BigInt(q.marks),
        };

        // Add media if present
        if (q.media && q.media.blob) {
          baseQuestion.media = {
            blob: q.media.blob,
            mediaType: q.media.mediaType,
            description: q.media.description,
          };
        }

        return baseQuestion;
      }),
    };
  };

  return {
    formState,
    convertToBackendTest,
    updateField,
    addQuestion,
    removeQuestion,
    updateQuestion,
    validateForm,
    resetForm,
  };
}
