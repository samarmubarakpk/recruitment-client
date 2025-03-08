import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
interface Vacancy {
  id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  applicationDeadline: string;
  status: 'active' | 'closed';
  applicationCount: number;
  interviewCount: number;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  matchScore: number;
  cvAnalysisStatus: 'pending' | 'completed';
  interviewStatus: 'pending' | 'scheduled' | 'completed';
  interviewScore?: number;
}

interface VacancyDetailsProps {
  vacancy: Vacancy;
  onClose: () => void;
  onRefresh: () => void;
}

// Vacancy details component with candidate list
const VacancyDetails: React.FC<VacancyDetailsProps> = ({ vacancy, onClose, onRefresh }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiModelTrained, setAiModelTrained] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // Fetch candidates for this vacancy
        const response = await api.get(`/vacancies/${vacancy.id}/candidates`);
        setCandidates(response.data.candidates);
        
        // Check if AI model is trained for this vacancy
        const modelResponse = await api.get(`/vacancies/${vacancy.id}/ai-model`);
        setAiModelTrained(modelResponse.data.trained);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [vacancy.id]);

  const handleTrainModel = async () => {
    try {
      setIsTraining(true);
      setTrainingProgress(0);
      
      // Start training process
      const response = await api.post(`/vacancies/${vacancy.id}/train-model`);
      
      // Set up polling for training progress
      const trainingInterval = setInterval(async () => {
        try {
          const progressResponse = await api.get(`/vacancies/${vacancy.id}/training-progress`);
          const progress = progressResponse.data.progress;
          setTrainingProgress(progress);
          
          if (progress >= 100) {
            clearInterval(trainingInterval);
            setIsTraining(false);
            setAiModelTrained(true);
            onRefresh(); // Refresh vacancy data
          }
        } catch (error) {
          console.error('Error checking training progress:', error);
          clearInterval(trainingInterval);
          setIsTraining(false);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error training model:', error);
      setIsTraining(false);
    }
  };

  const handleViewCV = (candidateId: number) => {
    window.open(`/candidate/${candidateId}/cv`, '_blank');
  };

  const handleViewInterviewRecording = (candidateId: number) => {
    navigate(`/interview-recording/${vacancy.id}/${candidateId}`);
  };

  const handleViewInterviewReport = (candidateId: number) => {
    navigate(`/interview-report/${vacancy.id}/${candidateId}`);
  };

  const handleRunCVAnalysis = async (candidateId: number) => {
    try {
      await api.post(`/vacancies/${vacancy.id}/analyze-cv/${candidateId}`);
      
      // Update candidate list after analysis
      const response = await api.get(`/vacancies/${vacancy.id}/candidates`);
      setCandidates(response.data.candidates);
      
      alert('CV analysis completed successfully!');
    } catch (error) {
      console.error('Error analyzing CV:', error);
      alert('Failed to analyze CV. Please try again.');
    }
  };

  return (
    <div className="vacancy-details-modal">
      <div className="modal-header">
        <h3>{vacancy.title}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="vacancy-info">
        <p><strong>Location:</strong> {vacancy.location}</p>
        <p><strong>Status:</strong> {vacancy.status}</p>
        <p><strong>Applications:</strong> {vacancy.applicationCount}</p>
        <p><strong>Interviews:</strong> {vacancy.interviewCount}</p>
        <p><strong>Deadline:</strong> {new Date(vacancy.applicationDeadline).toLocaleDateString()}</p>
        
        <div className="ai-model-section">
          <h4>AI Interview Model</h4>
          {aiModelTrained ? (
            <div className="model-status trained">
              <span className="status-indicator"></span>
              <span>Model trained and ready</span>
            </div>
          ) : isTraining ? (
            <div className="model-training">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${trainingProgress}%` }}></div>
              </div>
              <p>Training in progress: {trainingProgress}%</p>
            </div>
          ) : (
            <div className="model-status untrained">
              <span className="status-indicator"></span>
              <span>Model not trained</span>
              <button className="train-btn" onClick={handleTrainModel}>Train Model</button>
              <p className="info-text">
                Training the AI model will enable automatic generation of relevant interview questions
                based on the job requirements and candidate skills.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="candidates-section">
        <h4>Candidates ({candidates.length})</h4>
        
        {loading ? (
          <p>Loading candidates...</p>
        ) : candidates.length === 0 ? (
          <p>No candidates have applied yet.</p>
        ) : (
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Match Score</th>
                <th>CV Analysis</th>
                <th>Interview Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>
                    <div className="match-score">
                      <div className="score-bar" style={{ width: `${candidate.matchScore}%` }}></div>
                      <span>{candidate.matchScore}%</span>
                    </div>
                  </td>
                  <td>
                    {candidate.cvAnalysisStatus === 'completed' ? (
                      <span className="status-badge completed">Analyzed</span>
                    ) : (
                      <button 
                        className="analyze-btn" 
                        onClick={() => handleRunCVAnalysis(candidate.id)}
                      >
                        Analyze CV
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${candidate.interviewStatus}`}>
                      {candidate.interviewStatus === 'completed' 
                        ? `Completed (${candidate.interviewScore}/100)` 
                        : candidate.interviewStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleViewCV(candidate.id)}>View CV</button>
                      {candidate.interviewStatus === 'completed' && (
                        <>
                          <button onClick={() => handleViewInterviewRecording(candidate.id)}>
                            View Recording
                          </button>
                          <button onClick={() => handleViewInterviewReport(candidate.id)}>
                            View Report
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [vacancyFormData, setVacancyFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    applicationDeadline: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    fetchVacancies();
  }, [navigate]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/company/vacancies');
      setVacancies(response.data);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVacancyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVacancyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVacancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (vacancyFormData.title.trim() === '') {
        alert('Please enter a valid job title.');
        return;
      }
      
      await api.post('/company/vacancies', vacancyFormData);
      
      // Reset form and hide it
      setVacancyFormData({
        title: '',
        description: '',
        requirements: '',
        location: '',
        applicationDeadline: ''
      });
      setShowVacancyForm(false);
      
      // Refresh vacancies
      fetchVacancies();
    } catch (error) {
      console.error('Error creating vacancy:', error);
      alert('Failed to create vacancy. Please try again.');
    }
  };

  const handleDeleteVacancy = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) {
      return;
    }
    
    try {
      await api.delete(`/company/vacancies/${id}`);
      fetchVacancies();
    } catch (error) {
      console.error('Error deleting vacancy:', error);
      alert('Failed to delete vacancy. Please try again.');
    }
  };

  return (
    <div className="company-dashboard">
      <h2>Company Dashboard</h2>
      
      <div className="dashboard-actions">
        <button 
          className="create-vacancy-btn"
          onClick={() => setShowVacancyForm(true)}
        >
          Post New Vacancy
        </button>
      </div>
      
      {showVacancyForm && (
        <div className="vacancy-form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Vacancy</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowVacancyForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleVacancySubmit}>
              <div className="form-group">
                <label htmlFor="title">Job Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={vacancyFormData.title}
                  onChange={handleVacancyFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Job Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={vacancyFormData.description}
                  onChange={handleVacancyFormChange}
                  rows={4}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="requirements">Requirements:</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={vacancyFormData.requirements}
                  onChange={handleVacancyFormChange}
                  rows={4}
                  required
                ></textarea>
                <p className="hint-text">
                  List required skills, experience, and qualifications. 
                  This will be used by our AI to match candidates and generate interview questions.
                </p>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={vacancyFormData.location}
                  onChange={handleVacancyFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="applicationDeadline">Application Deadline:</label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={vacancyFormData.applicationDeadline}
                  onChange={handleVacancyFormChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">Create Vacancy</button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowVacancyForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="vacancies-list">
        <h3>Your Job Vacancies</h3>
        
        {loading ? (
          <p>Loading vacancies...</p>
        ) : vacancies.length === 0 ? (
          <p>No vacancies posted yet. Create your first job posting to get started!</p>
        ) : (
          <div className="vacancy-cards">
            {vacancies.map(vacancy => (
              <div key={vacancy.id} className="vacancy-card">
                <h4>{vacancy.title}</h4>
                <p className="location">{vacancy.location}</p>
                <p className="deadline">Deadline: {new Date(vacancy.applicationDeadline).toLocaleDateString()}</p>
                <div className="vacancy-stats">
                  <span className="stat">
                    <strong>{vacancy.applicationCount}</strong> Applications
                  </span>
                  <span className="stat">
                    <strong>{vacancy.interviewCount}</strong> Interviews
                  </span>
                </div>
                <div className="vacancy-actions">
                  <button 
                    onClick={() => setSelectedVacancy(vacancy)}
                    className="view-details-btn"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDeleteVacancy(vacancy.id)} 
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedVacancy && (
        <VacancyDetails 
          vacancy={selectedVacancy} 
          onClose={() => setSelectedVacancy(null)}
          onRefresh={fetchVacancies}
        />
      )}
    </div>
  );
};

export default CompanyDashboard;