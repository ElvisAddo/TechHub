import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { categoryService, Category } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';

const NewQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0]._id);
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !categoryId) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const question = await questionService.create(title, content, categoryId);
      navigate(`/questions/${question._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ask a Question</h1>
          <p className="text-slate-600 mb-8">
            Share your question with the community and get answers from experts
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Question Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="e.g., How do I center a div in CSS?"
              />
              <p className="text-sm text-slate-500 mt-2">
                Be specific and imagine you're asking a question to another person
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                Question Details
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              
                rows={10}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Provide all the details someone would need to answer your question..."
              />
              <p className="text-sm text-slate-500 mt-2">
                Include relevant code, error messages, or examples to help others understand your issue
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Post Question'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewQuestion;
