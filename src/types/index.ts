export interface Subject {
  id: string;
  name: string;
  createdAt: number;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: number;
  photos: string[];
  quizzes: Quiz[];
}

export interface Quiz {
  id: string;
  topicId: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'identification' | 'true-false';
  question: string;
  choices?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, string>;
  timestamp: number;
}

export interface ProgressStats {
  subjectId: string;
  topicId: string;
  quizzesTaken: number;
  latestScore: number;
  bestScore: number;
  averageScore: number;
  questionsAnswered: number;
  correctAnswers: number;
}
