import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
interface Vacancy {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  applicationDeadline: string;
}

interface Interview {
  id: number;
  vacancyId: number;
  vacancyTitle: string;
  company: string;
  scheduledDateTime: string;
  status: 'scheduled' | 'completed' | 'missed';
}

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cvUploaded, setCvUploaded] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>('');
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user data including cv status
    const fetchData = async () => {
      try {
        // Fetch user CV status
        const userResponse = await api.get('/candidate/profile');
        setCvUploaded(userResponse.data.hasCv);
        
        // Fetch available vacancies
        const vacanciesResponse = await api.get('/vacancies');
        setVacancies(vacanciesResponse.data);
        
        // Fetch scheduled interviews
        const interviewsResponse = await api.get('/candidate/interviews');
        setInterviews(interviewsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file is PDF
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file');
      return;
    }
    
    const formData = new FormData();
    formData.append('cv', file);
    
    try {
      setUploadProgress(0);
      setUploadError('');
      
      await api.post('/candidate/upload-cv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setCvUploaded(true);
      setUploadProgress(100);
      
      // Show success message
      alert('CV uploaded successfully! Our AI will now analyze your resume.');
    } catch (error: any) {
      console.error('CV upload error:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload CV. Please try again.');
    }
  };

  const applyForJob = async (vacancyId: number) => {
    if (!cvUploaded) {
      alert('Please upload your CV before applying for jobs');
      return;
    }

    try {
      await api.post(`/applications/apply/${vacancyId}`);
      alert('Application submitted successfully!');
      
      // You may want to update UI to show application status
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const startInterview = (interviewId: number) => {
    navigate(`/interview/${interviewId}`);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="candidate-dashboard">
      <h2>Candidate Dashboard</h2>
      
      <section className="cv-section">
        <h3>Your CV</h3>
        {cvUploaded ? (
          <div className="cv-status">
            <p>Your CV has been uploaded and processed by our AI system.</p>
            <button 
              onClick={() => document.getElementById('cv-upload')?.click()}
              className="update-cv-btn"
            >
              Update CV
            </button>
          </div>
        ) : (
          <div className="cv-upload-container">
            <p>Please upload your CV to apply for jobs and schedule interviews.</p>
            <button 
              onClick={() => document.getElementById('cv-upload')?.click()}
              className="upload-cv-btn"
            >
              Upload CV (PDF)
            </button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            {uploadError && <p className="error-message">{uploadError}</p>}
          </div>
        )}
        <input
          type="file"
          id="cv-upload"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleCvUpload}
        />
      </section>
      
      <section className="vacancies-section">
        <h3>Available Positions</h3>
        {vacancies.length === 0 ? (
          <p>No vacancies available at the moment.</p>
        ) : (
          <div className="vacancy-list">
            {vacancies.map(vacancy => (
              <div key={vacancy.id} className="vacancy-card">
                <h4>{vacancy.title}</h4>
                <p className="company">{vacancy.company}</p>
                <p className="location">{vacancy.location}</p>
                <p className="deadline">Application Deadline: {new Date(vacancy.applicationDeadline).toLocaleDateString()}</p>
                <div className="vacancy-actions">
                  <button onClick={() => navigate(`/vacancy/${vacancy.id}`)}>View Details</button>
                  <button 
                    onClick={() => applyForJob(vacancy.id)}
                    disabled={!cvUploaded}
                    className={!cvUploaded ? 'disabled' : ''}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section className="interviews-section">
        <h3>Your Interviews</h3>
        {interviews.length === 0 ? (
          <p>No interviews scheduled yet. Apply for jobs to get started!</p>
        ) : (
          <div className="interview-list">
            {interviews.map(interview => (
              <div key={interview.id} className="interview-card">
                <h4>{interview.vacancyTitle}</h4>
                <p className="company">{interview.company}</p>
                <p className="date-time">
                  Scheduled for: {new Date(interview.scheduledDateTime).toLocaleString()}
                </p>
                <p className="status">Status: {interview.status}</p>
                {interview.status === 'scheduled' && (
                  <button 
                    onClick={() => startInterview(interview.id)}
                    className="start-interview-btn"
                  >
                    Start Interview
                  </button>
                )}
                {interview.status === 'completed' && (
                  <button 
                    onClick={() => navigate(`/interview-results/${interview.id}`)}
                    className="view-results-btn"
                  >
                    View Results
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CandidateDashboard;