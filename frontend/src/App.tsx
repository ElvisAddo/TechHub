import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuestionsList from './pages/QuestionsList';
import QuestionDetail from './pages/QuestionDetail';
import NewQuestion from './pages/NewQuestion';
import Categories from './pages/Categories';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:categoryId" element={<QuestionsList />} />
                    <Route path="/questions/new" element={<NewQuestion />} />
                    <Route path="/questions/:id" element={<QuestionDetail />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

