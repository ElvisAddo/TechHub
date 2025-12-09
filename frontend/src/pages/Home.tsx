import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category } from '../services/categoryService';
import { questionService, Question } from '../services/questionService';
import { answerService } from '../services/answerService';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    categories: true,
    questions: true
  });
  const [error, setError] = useState<{
    categories?: string;
    questions?: string;
    general?: string;
  }>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answerContents, setAnswerContents] = useState<{ [key: string]: string }>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(prev => ({ ...prev, categories: true, questions: true }));
      setError({});

      const [categoriesData, questionsData] = await Promise.all([
        categoryService.getAll().catch(err => {
          console.error('Error loading categories:', err);
          setError(prev => ({ ...prev, categories: 'Failed to load categories' }));
          return [];
        }),
        questionService.getAll().catch(err => {
          console.error('Error loading questions:', err);
          setError(prev => ({ ...prev, questions: 'Failed to load questions' }));
          return [];
        }),
      ]);

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setFilteredQuestions(Array.isArray(questionsData) ? questionsData : []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(prev => ({ ...prev, general: 'An unexpected error occurred' }));
    } finally {
      setIsLoading(prev => ({
        ...prev,
        categories: false,
        questions: false
      }));
    }
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter((q) => {
        const catId = typeof q.category === 'string' ? q.category : q.category._id;
        return catId === categoryId;
      });
      setFilteredQuestions(filtered);
    }
  };

  const getRelatedQuestions = (currentQuestionId: string) => {
    if (!currentQuestionId || !questions?.length) return [];
    
    const currentQuestion = questions.find((q) => q?._id === currentQuestionId);
    if (!currentQuestion?.category) return [];

    const catId = typeof currentQuestion.category === 'string'
      ? currentQuestion.category
      : currentQuestion.category?._id;

    if (!catId) return [];

    return questions
      .filter((q) => {
        if (!q?.category) return false;
        const qCatId = typeof q.category === 'string' ? q.category : q.category?._id;
        return qCatId && qCatId === catId && q._id !== currentQuestionId;
      })
      .slice(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryName = (question: Question) => {
    if (!question?.category) return 'Uncategorized';
    
    if (typeof question.category === 'string') {
      const cat = categories.find((c) => c?._id === question.category);
      return cat?.name || 'Unknown';
    }
    
    return question.category?.name || 'Unknown';
  };

  const toggleAnswerBox = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleAnswerChange = (questionId: string, content: string) => {
    setAnswerContents({
      ...answerContents,
      [questionId]: content,
    });
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const content = answerContents[questionId];
    if (!content || !content.trim()) {
      return;
    }

    setSubmittingAnswer(questionId);
    try {
      await answerService.add(questionId, content);
      setAnswerContents({
        ...answerContents,
        [questionId]: '',
      });
      await loadData();
      toggleAnswerBox(questionId);
    } catch (err) {
      setError(prev => ({ ...prev, general: 'Failed to submit answer' }));
      console.error('Error submitting answer:', err);
    } finally {
      setSubmittingAnswer(null);
    }
  };

  if (isLoading.categories && isLoading.questions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white shadow-lg fixed h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Categories</h2>

          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">All Questions</span>
              <span className="text-sm">{questions.length}</span>
            </div>
          </button>

          {(error.categories || error.questions || error.general) && (
            <div className="space-y-2 mb-4">
              {error.categories && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error.categories}
                </div>
              )}
              {error.questions && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error.questions}
                </div>
              )}
              {error.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error.general}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {categories && categories?.map((category) => {
              const count = questions.filter((q) => {
                const catId = typeof q.category === 'string' ? q?.category : q.category?._id;
                return catId === category._id;
              }).length;

              return (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedCategory === category._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm">{count}</span>
                  </div>
                  {category.description && selectedCategory === category._id && (
                    <p className="text-sm mt-1 opacity-90">{category.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {selectedCategory === null
                  ? 'All Questions'
                  : categories.find((c) => c._id === selectedCategory)?.name || 'Questions'}
              </h1>
              <p className="text-slate-600">
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/questions/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition shadow-md hover:shadow-lg"
            >
              Ask Question
            </Link>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg
                className="w-16 h-16 text-slate-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-slate-600 text-lg mb-4">No questions yet.</p>
              <Link
                to="/questions/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Be the first to ask
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => {
                const relatedQuestions = getRelatedQuestions(question._id);

                return (
                  <div key={question._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                    <Link
                      to={`/questions/${question._id}`}
                      className="block p-6 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {getCategoryName(question)}
                            </span>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition mb-2">
                            {question.title}
                          </h2>
                          <p className="text-slate-600 line-clamp-2 mb-4">{question.content}</p>
                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                             
                              
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {question.answers?.length || 0} answers
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatDate(question.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg
                            className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>

                    {relatedQuestions.length > 0 && (
                      <div className="border-t border-slate-100 px-6 py-4 bg-slate-50">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Related Questions:</h4>
                        <div className="space-y-1">
                          {relatedQuestions.map((related) => (
                            <Link
                              key={related._id}
                              to={`/questions/${related._id}`}
                              className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {related.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-100 px-6 py-4">
                      {user ? (
                        <div>
                          {!expandedQuestions.has(question._id) ? (
                            <button
                              onClick={() => toggleAnswerBox(question._id)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Answer
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-900">Your Answer</h4>
                                <button
                                  onClick={() => toggleAnswerBox(question._id)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <textarea
                                value={answerContents[question._id] || ''}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                placeholder="Write your answer here..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                                disabled={submittingAnswer === question._id}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSubmitAnswer(question._id)}
                                  disabled={
                                    !answerContents[question._id]?.trim() ||
                                    submittingAnswer === question._id
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition"
                                >
                                  {submittingAnswer === question._id ? 'Submitting...' : 'Submit Answer'}
                                </button>
                                <button
                                  onClick={() => toggleAnswerBox(question._id)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2 rounded-lg transition"
                                  disabled={submittingAnswer === question._id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-600">
                          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                            Log in
                          </Link>{' '}
                          or{' '}
                          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                            sign up
                          </Link>{' '}
                          to answer this question
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
