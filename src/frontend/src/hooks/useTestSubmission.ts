import { useState } from 'react';
import { useCreateStudentResponse } from './useQueries';
import type { Test, Answer, StudentResponse } from '../backend';

export function useTestSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createResponseMutation = useCreateStudentResponse();

  const calculateBand = (correctCount: number): number => {
    if (correctCount >= 39) return 9.0;
    if (correctCount >= 37) return 8.5;
    if (correctCount >= 35) return 8.0;
    if (correctCount >= 33) return 7.5;
    if (correctCount >= 30) return 7.0;
    if (correctCount >= 27) return 6.5;
    if (correctCount >= 23) return 6.0;
    if (correctCount >= 19) return 5.5;
    if (correctCount >= 15) return 5.0;
    return 0.0;
  };

  const submitTest = async (
    test: Test,
    answers: Answer[],
    studentName: string,
    batchNumber: string,
    timeTaken: number
  ): Promise<StudentResponse> => {
    setIsSubmitting(true);

    try {
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalScore = 0;

      test.questions.forEach((question) => {
        if (question.questionType === 'longAnswer') {
          return;
        }

        const studentAnswer = answers.find((a) => a.questionId === question.id);
        if (studentAnswer) {
          const isCorrect =
            studentAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
          if (isCorrect) {
            totalCorrect++;
            totalScore += Number(question.marks);
          } else {
            totalWrong++;
          }
        } else {
          totalWrong++;
        }
      });

      const estimatedBand = calculateBand(totalCorrect);

      const response: StudentResponse = {
        id: BigInt(Date.now()),
        studentName,
        batchNumber,
        testId: test.id,
        submissionTimestamp: BigInt(Date.now() * 1000000),
        answers,
        totalScore: BigInt(totalScore),
        totalCorrect: BigInt(totalCorrect),
        totalWrong: BigInt(totalWrong),
        estimatedBand,
        timeTaken: BigInt(timeTaken),
      };

      await createResponseMutation.mutateAsync(response);
      return response;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTest,
    isSubmitting,
  };
}
