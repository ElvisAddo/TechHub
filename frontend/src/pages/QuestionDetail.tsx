import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionService, Question } from '../services/questionService';
import { answerService } from '../services/answerService';
import { useAuth } from '../context/AuthContext';
import { User } from '../services/authService';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      const data = await questionService.getById(id!);
      setQuestion(data);
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await answerService.add(id!, answerContent);
      setAnswerContent('');
      await loadQuestion();
    } catch (err) {
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">Question not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const questionUser = question.user as User;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {questionUser.username[0].toUpperCase()}
              </div>
              <span className="font-medium text-slate-700">{questionUser.username}</span>
            </div>
            <span>•</span>
            <span>{formatDate(question.createdAt)}</span>
          </div>
          <div className="prose max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap">{question.content}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {question.answers?.length || 0} Answers
          </h2>

          <div className="space-y-4">
            {question.answers?.map((answer) => (
              <div key={answer._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {answer.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{answer.user.username}</span>
                      <span className="text-sm text-slate-500">{formatDate(answer.createdAt)}</span>
                      {answer.isAccepted && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          Accepted
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{answer.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Your Answer</h3>
          {user ? (
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Write your answer here..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-4">You need to be logged in to post an answer</p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
