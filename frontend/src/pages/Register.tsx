import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (touched.username) {
      if (username.length < 3) {
        setUsernameError('Invalid Username.');
      } else {
        setUsernameError('');
      }
    }
  }, [username, touched.username]);

  useEffect(() => {
    if (touched.password) {
      const hasNumber = /\d/.test(password);
      const isLongEnough = password.length >= 6;

      if (!isLongEnough || !hasNumber) {
        setPasswordError('Invalid password. Enter a password that is at least 6 characters long and contains a number.');
      } else {
        setPasswordError('');
      }
    }
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.confirmPassword) {
      if (confirmPassword && password !== confirmPassword) {
        setConfirmPasswordError('The two passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }
  }, [password, confirmPassword, touched.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
    });

    if (username.length < 3) {
      return;
    }

    const hasNumber = /\d/.test(password);
    if (password.length < 6 || !hasNumber) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      await register(username, `${username}@example.com`, password);
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '';
      if (errorMessage.includes('username') || errorMessage.includes('exists')) {
        setUsernameError('Username already exists.');
      } else {
        setError('Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="border-2 border-slate-300 p-8">
          <h1 className="text-xl font-semibold text-slate-900 mb-6">Register user</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex items-start gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched({ ...touched, username: true })}
                placeholder="Enter Username"
                className="flex-1 px-3 py-2 border border-slate-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex-1 min-h-[40px]">
                {usernameError && (
                  <p className="text-red-500 text-sm">{usernameError}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="Enter password"
                className="flex-1 px-3 py-2 border border-slate-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex-1 min-h-[40px]">
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                placeholder="Re-enter Password"
                className="flex-1 px-3 py-2 border border-slate-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex-1 min-h-[40px]">
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm">{confirmPasswordError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 border-slate-400"
              />
              <label htmlFor="terms" className="text-sm text-slate-700">
                I agree to the Terms and Conditions and Privacy Policy
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !!usernameError || !!passwordError || !!confirmPasswordError}
                className="bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900 font-medium px-8 py-2 border border-slate-400 rounded transition"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
