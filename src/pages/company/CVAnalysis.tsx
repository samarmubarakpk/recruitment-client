import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
// CV Analysis component - displays the results of Azure Form Recognizer processing
// This component shows how the AI system extracts and analyzes candidate CV data
const CVAnalysis: React.FC = () => {
  const { vacancyId, candidateId } = useParams<{ vacancyId: string, candidateId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<CVAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await api.get(`/cv-analysis/${vacancyId}/${candidateId}`);
        setAnalysisData(response.data);
      } catch (err: any) {
        console.error('Error fetching CV analysis data:', err);
        setError(err.response?.data?.message || 'Failed to load CV analysis data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [vacancyId, candidateId]);
  
  if (loading) {
    return <div className="loading">Loading CV analysis...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!analysisData) {
    return <div className="error-message">CV analysis data not found.</div>;
  }
  
  return (
    <div className="cv-analysis">
      <div className="analysis-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>CV Analysis</h2>
      </div>
      
      <div className="analysis-summary">
        <div className="candidate-info">
          <h3>{analysisData.candidateName}</h3>
          <p>Position: {analysisData.vacancyTitle}</p>
          <p>Analysis Date: {new Date(analysisData.analysisDate).toLocaleDateString()}</p>
        </div>
        
        <div className="match-score-container">
          <div className="match-score">
            <div 
              className="score-circle" 
              style={{ 
                background: `conic-gradient(
                  ${analysisData.matchScore >= 70 ? '#28a745' : 
                    analysisData.matchScore >= 50 ? '#ffc107' : '#dc3545'} 
                  ${analysisData.matchScore}%, #f0f0f0 0)` 
              }}
            >
              <span className="score-value">{analysisData.matchScore}%</span>
            </div>
            <p className="score-label">Match Score</p>
          </div>
        </div>
      </div>
      
      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        <button 
          className={`tab ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Education
        </button>
        <button 
          className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience
        </button>
        <button 
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills
        </button>
        {analysisData.extractedData.projects && analysisData.extractedData.projects.length > 0 && (
          <button 
            className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
        )}
      </div>
      
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="assessment-section">
              <h3>Overall Assessment</h3>
              <p>{analysisData.overallAssessment}</p>
              
              <div className="ai-recommendation">
                <h4>AI Recommendation</h4>
                <p>{analysisData.aiRecommendation}</p>
              </div>
            </div>
            
            <div className="skill-match-section">
              <h3>Skill Matches</h3>
              
              <div className="skill-categories">
                <div className="matched-skills">
                  <h4>Matched Skills</h4>
                  <ul>
                    {analysisData.skillMatches.matched.map((skill, index) => (
                      <li key={index} className="matched">{skill}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="missing-skills">
                  <h4>Missing Skills</h4>
                  <ul>
                    {analysisData.skillMatches.missing.map((skill, index) => (
                      <li key={index} className="missing">{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="experience-summary">
              <h3>Experience Analysis</h3>
              <p><strong>Relevant Experience:</strong> {analysisData.experienceAnalysis.relevantYears} years</p>
              <p><strong>Relevance Score:</strong> {analysisData.experienceAnalysis.relevanceScore}/100</p>
              
              <h4>Key Highlights</h4>
              <ul>
                {analysisData.experienceAnalysis.keyHighlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
            
            <div className="vacancy-requirements">
              <h3>Vacancy Requirements</h3>
              <div className="requirement-group">
                <h4>Required Skills</h4>
                <ul>
                  {analysisData.vacancyRequirements.requiredSkills.map((skill, index) => (
                    <li 
                      key={index}
                      className={analysisData.skillMatches.matched.includes(skill) ? 'matched' : 'missing'}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="requirement-group">
                <h4>Preferred Skills</h4>
                <ul>
                  {analysisData.vacancyRequirements.preferredSkills.map((skill, index) => (
                    <li 
                      key={index}
                      className={analysisData.skillMatches.matched.includes(skill) ? 'matched' : 'missing'}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="requirement-group">
                <h4>Experience</h4>
                <p>{analysisData.vacancyRequirements.experience}</p>
              </div>
              
              <div className="requirement-group">
                <h4>Education</h4>
                <p>{analysisData.vacancyRequirements.education}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'personal' && (
          <div className="personal-tab">
            <h3>Personal Information</h3>
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{analysisData.extractedData.personalInfo.name}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{analysisData.extractedData.personalInfo.email}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{analysisData.extractedData.personalInfo.phone}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Location:</span>
                <span className="info-value">{analysisData.extractedData.personalInfo.location}</span>
              </div>
              
              {analysisData.extractedData.personalInfo.linkedIn && (
                <div className="info-item">
                  <span className="info-label">LinkedIn:</span>
                  <span className="info-value">{analysisData.extractedData.personalInfo.linkedIn}</span>
                </div>
              )}
              
              {analysisData.extractedData.personalInfo.website && (
                <div className="info-item">
                  <span className="info-label">Website:</span>
                  <span className="info-value">{analysisData.extractedData.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'education' && (
          <div className="education-tab">
            <h3>Education</h3>
            {analysisData.extractedData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="edu-header">
                  <h4>{edu.institution}</h4>
                  <span className="edu-dates">
                    {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                  </span>
                </div>
                <p className="degree">{edu.degree} in {edu.field}</p>
                {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'experience' && (
          <div className="experience-tab">
            <h3>Professional Experience</h3>
            {analysisData.extractedData.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="exp-header">
                  <h4>{exp.company}</h4>
                  <span className="exp-dates">
                    {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - 
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                  </span>
                </div>
                <p className="job-title">{exp.title}</p>
                <p className="job-location">{exp.location}</p>
                
                <ul className="job-description">
                  {exp.description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                
                {exp.technologies && (
                  <div className="technologies">
                    <p><strong>Technologies:</strong></p>
                    <div className="tech-tags">
                      {exp.technologies.map((tech, idx) => (
                        <span key={idx} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'skills' && (
          <div className="skills-tab">
            <h3>Skills</h3>
            
            <div className="skills-section">
              <h4>Technical Skills</h4>
              <div className="skill-tags">
                {analysisData.extractedData.skills.technical.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`skill-tag ${analysisData.skillMatches.matched.includes(skill) ? 'matched' : ''}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="skills-section">
              <h4>Soft Skills</h4>
              <div className="skill-tags">
                {analysisData.extractedData.skills.softSkills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`skill-tag ${analysisData.skillMatches.matched.includes(skill) ? 'matched' : ''}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="skills-section">
              <h4>Languages</h4>
              <div className="languages-list">
                {analysisData.extractedData.skills.languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <span className="language-name">{lang.language}</span>
                    <span className="language-proficiency">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {analysisData.extractedData.skills.certificates.length > 0 && (
              <div className="skills-section">
                <h4>Certifications</h4>
                <div className="certificates-list">
                  {analysisData.extractedData.skills.certificates.map((cert, index) => (
                    <div key={index} className="certificate-item">
                      <span className="certificate-name">{cert.name}</span>
                      <span className="certificate-issuer">{cert.issuer}</span>
                      <span className="certificate-date">{new Date(cert.date).getFullYear()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'projects' && analysisData.extractedData.projects && (
          <div className="projects-tab">
            <h3>Projects</h3>
            {analysisData.extractedData.projects.map((project, index) => (
              <div key={index} className="project-item">
                <h4>{project.name}</h4>
                <p className="project-description">{project.description}</p>
                
                {project.technologies && (
                  <div className="project-technologies">
                    <p><strong>Technologies:</strong></p>
                    <div className="tech-tags">
                      {project.technologies.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className={`tech-tag ${analysisData.skillMatches.matched.includes(tech) ? 'matched' : ''}`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                    Project Link
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="analysis-actions">
        <button 
          className="view-cv-btn"
          onClick={() => window.open(`/candidate/${candidateId}/cv`, '_blank')}
        >
          View Original CV
        </button>
        <button 
          className="print-btn"
          onClick={() => window.print()}
        >
          Print Analysis
        </button>
        <button 
          className="back-to-candidates"
          onClick={() => navigate(`/company/vacancy/${vacancyId}`)}
        >
          Back to Candidates List
        </button>
      </div>
    </div>
  );
};

export default CVAnalysis;

interface CVAnalysisData {
  candidateName: string;
  vacancyTitle: string;
  matchScore: number;
  analysisDate: string;
  extractedData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedIn?: string;
      website?: string;
    };
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>;
    experience: Array<{
      company: string;
      title: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string[];
      technologies?: string[];
    }>;
    skills: {
      technical: string[];
      softSkills: string[];
      languages: Array<{
        language: string;
        proficiency: string;
      }>;
      certificates: Array<{
        name: string;
        issuer: string;
        date: string;
      }>;
    };
    projects?: Array<{
      name: string;
      description: string;
      technologies?: string[];
      url?: string;
    }>;
  };
  vacancyRequirements: {
    requiredSkills: string[];
    preferredSkills: string[];
    experience: string;
    education: string;
  };
  skillMatches: {
    matched: string[];
    missing: string[];
  };
  experienceAnalysis: {
    relevantYears: number;
    relevanceScore: number;
    keyHighlights: string[];
  };
  overallAssessment: string;
  aiRecommendation: string;
}