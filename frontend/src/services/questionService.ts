import api from '../utils/api';
import { User } from './authService';
import { Category } from './categoryService';

export interface Answer {
  _id: string;
  content: string;
  user: User;
  question: string;
  isAccepted: boolean;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  title: string;
  content: string;
  user: User | string;
  category: Category | string;
  answers: Answer[];
  views: number;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export const questionService = {
  getAll: async (): Promise<Question[]> => {
    const response = await api.get<Question[]>('/questions');
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Question[]> => {
    const response = await api.get<Question[]>(`/questions/category/${categoryId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await api.get<Question>(`/questions/${id}`);
    return response.data;
  },

  create: async (title: string, content: string, categoryId: string): Promise<Question> => {
    const response = await api.post<Question>('/questions', {
      title,
      content,
      category: categoryId,
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};
