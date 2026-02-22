import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface AuthCredentials {
    username: string;
    password: string;
}
export interface Answer {
    answer: string;
    questionId: bigint;
}
export interface Test {
    id: bigint;
    title: string;
    testType: TestType;
    instructions: string;
    questions: Array<Question>;
}
export interface StudentResponse {
    id: bigint;
    totalCorrect: bigint;
    studentName: string;
    submissionTimestamp: bigint;
    answers: Array<Answer>;
    totalScore: bigint;
    batchNumber: string;
    timeTaken: bigint;
    estimatedBand: number;
    testId: bigint;
    totalWrong: bigint;
}
export interface Question {
    id: bigint;
    marks: bigint;
    media?: Media;
    text: string;
    correctAnswer: string;
    questionType: QuestionType;
    options: Array<string>;
}
export interface Media {
    blob: ExternalBlob;
    description: string;
    mediaType: Variant_audio_image;
}
export enum QuestionType {
    sentenceCompletion = "sentenceCompletion",
    shortAnswer = "shortAnswer",
    longAnswer = "longAnswer",
    multipleChoice = "multipleChoice",
    matching = "matching",
    trueFalseNotGiven = "trueFalseNotGiven"
}
export enum TestType {
    reading = "reading",
    mixed = "mixed",
    writing = "writing",
    listening = "listening"
}
export enum Variant_audio_image {
    audio = "audio",
    image = "image"
}
export interface backendInterface {
    createStudentResponse(response: StudentResponse): Promise<void>;
    createTest(creds: AuthCredentials, test: Test): Promise<void>;
    deleteStudentResponse(id: bigint): Promise<void>;
    deleteTest(creds: AuthCredentials, id: bigint): Promise<void>;
    getAllStudentResponses(): Promise<Array<StudentResponse>>;
    getAllTests(): Promise<Array<Test>>;
    getResponsesByBatch(batchNumber: string): Promise<Array<StudentResponse>>;
    getResponsesByTest(testId: bigint): Promise<Array<StudentResponse>>;
    getSortedResponses(): Promise<Array<StudentResponse>>;
    getStudentResponse(id: bigint): Promise<StudentResponse | null>;
    getTest(id: bigint): Promise<Test | null>;
    searchResponsesByName(searchTerm: string): Promise<Array<StudentResponse>>;
    updateStudentResponse(id: bigint, updatedResponse: StudentResponse): Promise<void>;
    updateTest(creds: AuthCredentials, id: bigint, updatedTest: Test): Promise<void>;
}
