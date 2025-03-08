import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
interface InterviewReportData {
  candidateName: string;
  vacancyTitle: string;
  company: string;
  interviewDate: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  relevanceScore: number;
  bodyLanguageScore: number;
  questions: QuestionData[];
  aiSummary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  comparisonRank: {
    percentile: number;
    totalCandidates: number;
  };
}

interface QuestionData {
  id: number;
  text: string;
  type: string;
  score: number;
  analysis: {
    relevance: number;
    confidence: number;
    technicalAccuracy?: number;
    keywordMatches?: string[];
    sentimentAnalysis: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
  aiComments: string;
}

const InterviewReport: React.FC = () => {
  const { vacancyId, candidateId } = useParams<{ vacancyId: string, candidateId: string }>();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<InterviewReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get(`/interview-reports/${vacancyId}/${candidateId}`);
        setReportData(response.data);
      } catch (err: any) {
        console.error('Error fetching interview report:', err);
        setError(err.response?.data?.message || 'Failed to load interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [vacancyId, candidateId]);
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#28a745'; // Green
    if (score >= 60) return '#17a2b8'; // Blue
    if (score >= 40) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };
  
  const getRecommendationText = (recommendation: string): string => {
    switch (recommendation) {
      case 'highly_recommended':
        return 'Highly Recommended';
      case 'recommended':
        return 'Recommended';
      case 'consider':
        return 'Consider';
      case 'not_recommended':
        return 'Not Recommended';
      default:
        return 'Unknown';
    }
  };
  
  const getRecommendationColor = (recommendation: string): string => {
    switch (recommendation) {
      case 'highly_recommended':
        return '#28a745'; // Green
      case 'recommended':
        return '#17a2b8'; // Blue
      case 'consider':
        return '#ffc107'; // Yellow
      case 'not_recommended':
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  };
  
  if (loading) {
    return <div className="loading">Loading interview report...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!reportData) {
    return <div className="error-message">Report data not found.</div>;
  }

  return (
    <div className="interview-report">
      <div className="report-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>Interview Report</h2>
      </div>
      
      <div className="report-summary">
        <div className="report-meta">
          <div className="meta-item">
            <span className="label">Candidate:</span>
            <span className="value">{reportData.candidateName}</span>
          </div>
          <div className="meta-item">
            <span className="label">Position:</span>
            <span className="value">{reportData.vacancyTitle}</span>
          </div>
          <div className="meta-item">
            <span className="label">Company:</span>
            <span className="value">{reportData.company}</span>
          </div>
          <div className="meta-item">
            <span className="label">Interview Date:</span>
            <span className="value">{new Date(reportData.interviewDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="overall-score">
          <div 
            className="score-circle" 
            style={{ 
              background: `conic-gradient(${getScoreColor(reportData.overallScore)} ${reportData.overallScore}%, #f0f0f0 0)` 
            }}
          >
            <span className="score-value">{reportData.overallScore}</span>
          </div>
          <div className="overall-recommendation" style={{ color: getRecommendationColor(reportData.recommendation) }}>
            {getRecommendationText(reportData.recommendation)}
          </div>
          <div className="percentile-rank">
            Top {reportData.comparisonRank.percentile}% of {reportData.comparisonRank.totalCandidates} candidates
          </div>
        </div>
      </div>
      
      <div className="score-breakdown">
        <h3>Performance Scores</h3>
        <div className="score-categories">
          <div className="score-category">
            <span className="category-name">Technical</span>
            <div className="score-bar-container">
              <div 
                className="score-bar" 
                style={{ 
                  width: `${reportData.technicalScore}%`,
                  backgroundColor: getScoreColor(reportData.technicalScore)
                }}
              ></div>
            </div>
            <span className="category-score">{reportData.technicalScore}%</span>
          </div>
          
          <div className="score-category">
            <span className="category-name">Communication</span>
            <div className="score-bar-container">
              <div 
                className="score-bar" 
                style={{ 
                  width: `${reportData.communicationScore}%`,
                  backgroundColor: getScoreColor(reportData.communicationScore)
                }}
              ></div>
            </div>
            <span className="category-score">{reportData.communicationScore}%</span>
          </div>
          
          <div className="score-category">
            <span className="category-name">Confidence</span>
            <div className="score-bar-container">
              <div 
                className="score-bar" 
                style={{ 
                  width: `${reportData.confidenceScore}%`,
                  backgroundColor: getScoreColor(reportData.confidenceScore)
                }}
              ></div>
            </div>
            <span className="category-score">{reportData.confidenceScore}%</span>
          </div>
          
          <div className="score-category">
            <span className="category-name">Relevance</span>
            <div className="score-bar-container">
              <div 
                className="score-bar" 
                style={{ 
                  width: `${reportData.relevanceScore}%`,
                  backgroundColor: getScoreColor(reportData.relevanceScore)
                }}
              ></div>
            </div>
            <span className="category-score">{reportData.relevanceScore}%</span>
          </div>
          
          <div className="score-category">
            <span className="category-name">Body Language</span>
            <div className="score-bar-container">
              <div 
                className="score-bar" 
                style={{ 
                  width: `${reportData.bodyLanguageScore}%`,
                  backgroundColor: getScoreColor(reportData.bodyLanguageScore)
                }}
              ></div>
            </div>
            <span className="category-score">{reportData.bodyLanguageScore}%</span>
          </div>
        </div>
      </div>
      
      <div className="ai-summary">
        <h3>AI-Generated Summary</h3>
        <div className="summary-content">
          <p>{reportData.aiSummary}</p>
        </div>
      </div>
      
      <div className="strengths-improvements">
        <div className="strengths">
          <h4>Key Strengths</h4>
          <ul>
            {reportData.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        
        <div className="improvements">
          <h4>Areas for Improvement</h4>
          <ul>
            {reportData.improvementAreas.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="question-analysis">
        <h3>Question-by-Question Analysis</h3>
        <div className="questions-list">
          {reportData.questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <span className="question-number">Q{index + 1}</span>
                <span className="question-type">{question.type.toUpperCase()}</span>
                <span 
                  className="question-score" 
                  style={{ color: getScoreColor(question.score) }}
                >
                  {question.score}/100
                </span>
              </div>
              
              <div className="question-text">{question.text}</div>
              
              <div className="question-metrics">
                <div className="metric">
                  <span className="metric-name">Relevance:</span>
                  <span className="metric-value">{question.analysis.relevance}/100</span>
                </div>
                <div className="metric">
                  <span className="metric-name">Confidence:</span>
                  <span className="metric-value">{question.analysis.confidence}/100</span>
                </div>
                {question.analysis.technicalAccuracy !== undefined && (
                  <div className="metric">
                    <span className="metric-name">Technical Accuracy:</span>
                    <span className="metric-value">{question.analysis.technicalAccuracy}/100</span>
                  </div>
                )}
              </div>
              
              {question.analysis.keywordMatches && question.analysis.keywordMatches.length > 0 && (
                <div className="keyword-matches">
                  <h5>Key Terms Used:</h5>
                  <div className="keywords">
                    {question.analysis.keywordMatches.map((keyword, i) => (
                      <span key={i} className="keyword">{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="sentiment-analysis">
                <h5>Response Sentiment:</h5>
                <div className="sentiment-bars">
                  <div className="sentiment-bar">
                    <span className="sentiment-label">Positive</span>
                    <div className="bar-container">
                      <div 
                        className="bar positive" 
                        style={{ width: `${question.analysis.sentimentAnalysis.positive * 100}%` }}
                      ></div>
                    </div>
                    <span className="sentiment-value">
                      {Math.round(question.analysis.sentimentAnalysis.positive * 100)}%
                    </span>
                  </div>
                  
                  <div className="sentiment-bar">
                    <span className="sentiment-label">Neutral</span>
                    <div className="bar-container">
                      <div 
                        className="bar neutral" 
                        style={{ width: `${question.analysis.sentimentAnalysis.neutral * 100}%` }}
                      ></div>
                    </div>
                    <span className="sentiment-value">
                      {Math.round(question.analysis.sentimentAnalysis.neutral * 100)}%
                    </span>
                  </div>
                  
                  <div className="sentiment-bar">
                    <span className="sentiment-label">Negative</span>
                    <div className="bar-container">
                      <div 
                        className="bar negative" 
                        style={{ width: `${question.analysis.sentimentAnalysis.negative * 100}%` }}
                      ></div>
                    </div>
                    <span className="sentiment-value">
                      {Math.round(question.analysis.sentimentAnalysis.negative * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ai-analysis">
                <h5>AI Analysis:</h5>
                <p>{question.aiComments}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="report-actions">
        <button 
          className="print-btn"
          onClick={() => window.print()}
        >
          Print Report
        </button>
        <button 
          className="download-btn"
          onClick={() => {
            // Create a downloadable PDF or JSON of the report
            alert('Download functionality will be implemented in future versions.');
          }}
        >
          Download Report
        </button>
        <button 
          className="view-recording-btn"
          onClick={() => navigate(`/interview-recording/${vacancyId}/${candidateId}`)}
        >
          View Interview Recording
        </button>
      </div>
    </div>
  );
};

export default InterviewReport;