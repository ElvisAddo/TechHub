import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category } from '../services/categoryService';
import { questionService, Question } from '../services/questionService';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, questionsData] = await Promise.all([
        categoryService.getAll(),
        questionService.getAll(),
      ]);
      setCategories(categoriesData);
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
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
    const currentQuestion = questions.find((q) => q._id === currentQuestionId);
    if (!currentQuestion) return [];

    const catId = typeof currentQuestion.category === 'string'
      ? currentQuestion.category
      : currentQuestion.category._id;

    return questions
      .filter((q) => {
        const qCatId = typeof q.category === 'string' ? q.category : q.category._id;
        return qCatId === catId && q._id !== currentQuestionId;
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
    if (typeof question.category === 'string') {
      const cat = categories.find((c) => c._id === question.category);
      return cat?.name || 'Unknown';
    }
    return question.category.name;
  };

  if (loading) {
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {categories.map((category) => {
              const count = questions.filter((q) => {
                const catId = typeof q.category === 'string' ? q.category : q.category._id;
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              {question.views} views
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
