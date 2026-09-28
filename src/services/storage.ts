import { Subject, Topic, Quiz, QuizResult, ProgressStats } from '../types';

const STORAGE_KEY_SUBJECTS = 'revuhelper_subjects';
const STORAGE_KEY_QUIZZES = 'revuhelper_quizzes';
const STORAGE_KEY_RESULTS = 'revuhelper_results';

// Subject Management
export const getSubjects = (): Subject[] => {
  const data = localStorage.getItem(STORAGE_KEY_SUBJECTS);
  return data ? JSON.parse(data) : [];
};

export const saveSubjects = (subjects: Subject[]): void => {
  localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
};

export const addSubject = (subjectName: string): Subject => {
  const subjects = getSubjects();
  const newSubject: Subject = {
    id: Date.now().toString(),
    name: subjectName,
    createdAt: Date.now(),
    topics: [],
  };
  subjects.push(newSubject);
  saveSubjects(subjects);
  return newSubject;
};

export const deleteSubject = (subjectId: string): void => {
  const subjects = getSubjects();
  const filtered = subjects.filter(s => s.id !== subjectId);
  saveSubjects(filtered);
};

export const getSubjectById = (subjectId: string): Subject | undefined => {
  const subjects = getSubjects();
  return subjects.find(s => s.id === subjectId);
};

// Topic Management
export const addTopic = (subjectId: string, topicName: string): Topic => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) throw new Error('Subject not found');
  
  const newTopic: Topic = {
    id: Date.now().toString(),
    name: topicName,
    subjectId,
    createdAt: Date.now(),
    photos: [],
    quizzes: [],
  };
  
  subject.topics.push(newTopic);
  saveSubjects(subjects);
  return newTopic;
};

export const getTopicById = (subjectId: string, topicId: string): Topic | undefined => {
  const subject = getSubjectById(subjectId);
  return subject?.topics.find(t => t.id === topicId);
};

export const deleteTopic = (subjectId: string, topicId: string): void => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  if (subject) {
    subject.topics = subject.topics.filter(t => t.id !== topicId);
    saveSubjects(subjects);
  }
};

// Photo Management
export const addPhotosToTopic = (subjectId: string, topicId: string, photos: string[]): void => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) throw new Error('Subject not found');
  
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) throw new Error('Topic not found');
  
  // Limit to 50 photos total
  const availableSlots = 50 - topic.photos.length;
  const photosToAdd = photos.slice(0, availableSlots);
  
  topic.photos.push(...photosToAdd);
  saveSubjects(subjects);
};

export const removePhotoFromTopic = (subjectId: string, topicId: string, photoIndex: number): void => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) throw new Error('Subject not found');
  
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) throw new Error('Topic not found');
  
  topic.photos.splice(photoIndex, 1);
  saveSubjects(subjects);
};

export const getTopicPhotos = (subjectId: string, topicId: string): string[] => {
  const topic = getTopicById(subjectId, topicId);
  return topic?.photos || [];
};

// Quiz Management
export const addQuizToTopic = (subjectId: string, topicId: string, quiz: Quiz): void => {
  const subjects = getSubjects();
  const subject = subjects.find(s => s.id === subjectId);
  
  if (!subject) throw new Error('Subject not found');
  
  const topic = subject.topics.find(t => t.id === topicId);
  if (!topic) throw new Error('Topic not found');
  
  topic.quizzes.push(quiz);
  saveSubjects(subjects);
};

export const getQuizzesByTopic = (subjectId: string, topicId: string): Quiz[] => {
  const topic = getTopicById(subjectId, topicId);
  return topic?.quizzes || [];
};

// Progress Calculation
export const calculateProgressStats = (subjectId: string, topicId: string): ProgressStats => {
  const topic = getTopicById(subjectId, topicId);
  
  if (!topic) {
    return {
      subjectId,
      topicId,
      quizzesTaken: 0,
      latestScore: 0,
      bestScore: 0,
      averageScore: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
    };
  }
  
  if (topic.quizzes.length === 0) {
    return {
      subjectId,
      topicId,
      quizzesTaken: 0,
      latestScore: 0,
      bestScore: 0,
      averageScore: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
    };
  }
  
  let totalScore = 0;
  let questionsAnswered = 0;
  let correctAnswers = 0;
  let bestScore = 0;
  let latestScore = 0;
  
  topic.quizzes.forEach((quiz, index) => {
    if (quiz.results.length > 0) {
      const result = quiz.results[quiz.results.length - 1];
      totalScore += (result.score / result.totalQuestions) * 100;
      questionsAnswered += result.totalQuestions;
      correctAnswers += result.score;
      
      if (index === topic.quizzes.length - 1) {
        latestScore = (result.score / result.totalQuestions) * 100;
      }
      
      if ((result.score / result.totalQuestions) * 100 > bestScore) {
        bestScore = (result.score / result.totalQuestions) * 100;
      }
    }
  });
  
  const averageScore = topic.quizzes.filter(q => q.results.length > 0).length > 0
    ? totalScore / topic.quizzes.filter(q => q.results.length > 0).length
    : 0;
  
  return {
    subjectId,
    topicId,
    quizzesTaken: topic.quizzes.filter(q => q.results.length > 0).length,
    latestScore: Math.round(latestScore),
    bestScore: Math.round(bestScore),
    averageScore: Math.round(averageScore),
    questionsAnswered,
    correctAnswers,
  };
};
