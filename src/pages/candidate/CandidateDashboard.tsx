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
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await api.get('/candidate/profile');
        setCvUploaded(userResponse.data.hasCv);

        const vacanciesResponse = await api.get('/vacancies');
        setVacancies(vacanciesResponse.data);

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
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percentCompleted);
        }
      });

      setCvUploaded(true);
      setUploadProgress(100);
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
            <button onClick={() => document.getElementById('cv-upload')?.click()} className="update-cv-btn">Update CV</button>
          </div>
        ) : (
          <div className="cv-upload-container">
            <p>Please upload your CV to apply for jobs and schedule interviews.</p>
            <button onClick={() => document.getElementById('cv-upload')?.click()} className="upload-cv-btn">Upload CV (PDF)</button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            {uploadError && <p className="error-message">{uploadError}</p>}
          </div>
        )}
        <input type="file" id="cv-upload" accept=".pdf" style={{ display: 'none' }} onChange={handleCvUpload} />
      </section>
    </div>
  );
};

export default CandidateDashboard;
