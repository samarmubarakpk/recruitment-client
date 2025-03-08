import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
// import AdminDashboard from './pages/admin/AdminDashboard';
import Interview from './pages/candidate/Interview';
import InterviewReport from './pages/company/InterviewReport';
// import InterviewRecording from './pages/company/InterviewRecording';
import CVAnalysis from './pages/company/CVAnalysis';
import InterviewQuestionGenerator from './pages/company/InterviewQuestionGenerator';
// import ManageCompanies from './pages/admin/ManageCompanies';
// import ManageUsers from './pages/admin/ManageUsers';

// Types
type UserType = 'candidate' | 'company' | 'admin' | null;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setUserType(userData.userType);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Auth-protected route component
  const ProtectedRoute: React.FC<{ 
    element: React.ReactNode, 
    allowedUserTypes?: UserType[],
    redirectPath?: string
  }> = ({ element, allowedUserTypes, redirectPath = '/login' }) => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to={redirectPath} replace />;
    }

    if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
      // Redirect to appropriate dashboard based on user type
      if (userType === 'candidate') {
        return <Navigate to="/candidate-dashboard" replace />;
      } else if (userType === 'company') {
        return <Navigate to="/company-dashboard" replace />;
      } else if (userType === 'admin') {
        return <Navigate to="/admin-dashboard" replace />;
      }
    }

    return <>{element}</>;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserType(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">Recruitment System</div>
          <div className="navbar-menu">
            <Link to="/">Home</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                {userType === 'candidate' && (
                  <Link to="/candidate-dashboard">Dashboard</Link>
                )}
                {userType === 'company' && (
                  <Link to="/company-dashboard">Dashboard</Link>
                )}
                {userType === 'admin' && (
                  <Link to="/admin-dashboard">Dashboard</Link>
                )}
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Candidate routes */}
          <Route 
            path="/candidate-dashboard" 
            element={
              <ProtectedRoute 
                element={<CandidateDashboard />} 
                allowedUserTypes={['candidate', 'admin']} 
              />
            } 
          />
          <Route 
            path="/interview/:interviewId" 
            element={
              <ProtectedRoute 
                element={<Interview />} 
                allowedUserTypes={['candidate', 'admin']} 
              />
            } 
          />
          
          {/* Company routes
          <Route 
            path="/company-dashboard" 
            element={
              <ProtectedRoute 
                element={<CompanyDashboard />} 
                allowedUserTypes={['company', 'admin']} 
              />
            } 
          />
          <Route 
            path="/interview-report/:vacancyId/:candidateId" 
            element={
              <ProtectedRoute 
                element={<InterviewReport />} 
                allowedUserTypes={['company', 'admin']} 
              />
            } 
          />
          <Route 
            path="/interview-recording/:vacancyId/:candidateId" 
            element={
              <ProtectedRoute 
                element={<InterviewRecording />} 
                allowedUserTypes={['company', 'admin']} 
              />
            } 
          /> */}
          <Route 
            path="/cv-analysis/:vacancyId/:candidateId" 
            element={
              <ProtectedRoute 
                element={<CVAnalysis />} 
                allowedUserTypes={['company', 'admin']} 
              />
            } 
          />
          <Route 
            path="/generate-questions/:vacancyId" 
            element={
              <ProtectedRoute 
                element={<InterviewQuestionGenerator />} 
                allowedUserTypes={['company', 'admin']} 
              />
            } 
          />
          
          {/* Admin routes
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute 
                element={<AdminDashboard />} 
                allowedUserTypes={['admin']} 
              />
            } 
          />
          <Route 
            path="/admin/companies" 
            element={
              <ProtectedRoute 
                element={<ManageCompanies />} 
                allowedUserTypes={['admin']} 
              />
            } 
          /> */}
          {/* <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute 
                element={<ManageUsers />} 
                allowedUserTypes={['admin']} 
              />
            } 
          /> */}
          
          {/* Default redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;