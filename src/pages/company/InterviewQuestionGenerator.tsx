import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
interface QuestionType {
  id: string;
  name: string;
  description: string;
  count: number;
  isActive: boolean;
}

interface VacancyData {
  id: number;
  title: string;
  description: string;
  requirements: string;
}

const InterviewQuestionGenerator: React.FC = () => {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const navigate = useNavigate();
  
  const [vacancy, setVacancy] = useState<VacancyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [customKeywords, setCustomKeywords] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  
  // Question type configuration
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    {
      id: 'technical',
      name: 'Technical Skills',
      description: 'Questions that assess specific technical abilities and knowledge relevant to the position.',
      count: 3,
      isActive: true
    },
    {
      id: 'behavioral',
      name: 'Behavioral',
      description: 'Questions about past experiences and how candidates handled specific situations.',
      count: 2,
      isActive: true
    },
    {
      id: 'situational',
      name: 'Situational',
      description: 'Hypothetical scenarios to assess problem-solving and critical thinking.',
      count: 2,
      isActive: true
    },
    {
      id: 'cultural',
      name: 'Cultural Fit',
      description: 'Questions to assess alignment with company values and team dynamics.',
      count: 1,
      isActive: true
    },
    {
      id: 'role_specific',
      name: 'Role-Specific',
      description: 'Questions tailored to specific responsibilities of the position.',
      count: 2,
      isActive: true
    }
  ]);
  
  useEffect(() => {
    const fetchVacancyData = async () => {
      try {
        // Fetch vacancy details
        const response = await api.get(`/vacancies/${vacancyId}`);
        setVacancy(response.data);
      } catch (err) {
        console.error('Error fetching vacancy data:', err);
        setError('Failed to load vacancy data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancyData();
  }, [vacancyId]);
  
  const handleTypeChange = (typeId: string, field: string, value: any) => {
    setQuestionTypes(prevTypes => 
      prevTypes.map(type => 
        type.id === typeId ? { ...type, [field]: value } : type
      )
    );
  };
  
  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setGeneratedQuestions([]);
      
      // Filter active question types
      const activeTypes = questionTypes.filter(type => type.isActive);
      
      // Prepare data for API
      const generationData = {
        vacancyId: vacancyId,
        questionTypes: activeTypes.map(type => ({
          type: type.id,
          count: type.count
        })),
        customKeywords: customKeywords.split(',').map(kw => kw.trim()).filter(kw => kw),
        additionalContext
      };
      
      // Start the question generation process
      const response = await api.post('/interviews/generate-questions', generationData);
      const { taskId } = response.data;
      
      // Poll for generation progress
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await api.get(`/interviews/generation-progress/${taskId}`);
          const { progress, status, questions } = progressResponse.data;
          
          setGenerationProgress(progress);
          
          if (status === 'completed') {
            clearInterval(pollInterval);
            setGeneratedQuestions(questions);
            setIsGenerating(false);
          }
        } catch (error) {
          console.error('Error checking generation progress:', error);
          clearInterval(pollInterval);
          setIsGenerating(false);
          setError('Error generating questions. Please try again.');
        }
      }, 1000);
    } catch (err) {
      console.error('Error starting question generation:', err);
      setIsGenerating(false);
      setError('Failed to generate interview questions. Please try again.');
    }
  };
  
  const handleSaveQuestions = async () => {
    try {
      await api.post(`/interviews/save-questions/${vacancyId}`, {
        questions: generatedQuestions
      });
      
      alert('Interview questions saved successfully!');
      navigate(`/company/vacancy/${vacancyId}`);
    } catch (err) {
      console.error('Error saving questions:', err);
      setError('Failed to save interview questions. Please try again.');
    }
  };
  
  const handleRegenerateQuestion = async (index: number) => {
    try {
      const question = generatedQuestions[index];
      
      const response = await api.post('/interviews/regenerate-question', {
        vacancyId: vacancyId,
        questionType: question.type,
        previousQuestion: question.text,
        customKeywords: customKeywords.split(',').map(kw => kw.trim()).filter(kw => kw),
        additionalContext
      });
      
      const newQuestion = response.data;
      
      // Update the question in the list
      setGeneratedQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        newQuestions[index] = newQuestion;
        return newQuestions;
      });
    } catch (err) {
      console.error('Error regenerating question:', err);
      setError('Failed to regenerate question. Please try again.');
    }
  };
  
  const handleEditQuestion = (index: number, newText: string) => {
    setGeneratedQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = { ...newQuestions[index], text: newText };
      return newQuestions;
    });
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!vacancy) {
    return <div className="error-message">Vacancy not found.</div>;
  }

  return (
    <div className="question-generator">
      <div className="generator-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h2>AI Interview Question Generator</h2>
      </div>
      
      <div className="vacancy-info">
        <h3>{vacancy.title}</h3>
        <div className="vacancy-details">
          <div className="detail-section">
            <h4>Job Description</h4>
            <p>{vacancy.description}</p>
          </div>
          <div className="detail-section">
            <h4>Requirements</h4>
            <p>{vacancy.requirements}</p>
          </div>
        </div>
      </div>
      
      <div className="generator-configuration">
        <h3>Configure Question Generation</h3>
        
        <div className="question-types">
          <h4>Question Types</h4>
          <div className="types-grid">
            {questionTypes.map(type => (
              <div key={type.id} className="type-card">
                <div className="type-header">
                  <div className="type-toggle">
                    <input 
                      type="checkbox" 
                      id={`toggle-${type.id}`}
                      checked={type.isActive}
                      onChange={e => handleTypeChange(type.id, 'isActive', e.target.checked)}
                    />
                    <label htmlFor={`toggle-${type.id}`}>{type.name}</label>
                  </div>
                  
                  <div className="question-count">
                    <label htmlFor={`count-${type.id}`}>Questions:</label>
                    <input 
                      type="number" 
                      id={`count-${type.id}`}
                      min="1" 
                      max="5"
                      value={type.count}
                      onChange={e => handleTypeChange(type.id, 'count', parseInt(e.target.value))}
                      disabled={!type.isActive}
                    />
                  </div>
                </div>
                
                <p className="type-description">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="additional-inputs">
          <div className="input-group">
            <label htmlFor="custom-keywords">Custom Keywords (comma-separated)</label>
            <input 
              type="text" 
              id="custom-keywords" 
              placeholder="e.g., React, cloud architecture, team management"
              value={customKeywords}
              onChange={e => setCustomKeywords(e.target.value)}
            />
            <p className="hint-text">
              Add specific skills or topics you want to ensure are covered in the questions.
            </p>
          </div>
          
          <div className="input-group">
            <label htmlFor="additional-context">Additional Context</label>
            <textarea 
              id="additional-context" 
              placeholder="Add any specific company information or context for the AI to consider when generating questions."
              rows={4}
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
            ></textarea>
          </div>
        </div>
        
        <button 
          className="generate-btn"
          onClick={handleGenerateQuestions}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Interview Questions'}
        </button>
      </div>
      
      {isGenerating && (
        <div className="generation-progress">
          <h3>Generating Questions...</h3>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
          <p>{generationProgress}% complete</p>
          <p className="ai-message">
            Our AI is analyzing the job requirements and creating tailored questions for this role.
          </p>
        </div>
      )}
      
      {generatedQuestions.length > 0 && (
        <div className="generated-questions">
          <h3>Generated Interview Questions</h3>
          
          <div className="questions-list">
            {generatedQuestions.map((question, index) => (
              <div key={index} className="question-card">
                <div className="question-header">
                  <span className="question-type">{question.type.toUpperCase()}</span>
                  <div className="question-actions">
                    <button
                      className="regenerate-btn"
                      onClick={() => handleRegenerateQuestion(index)}
                      title="Generate a new version of this question"
                    >
                      ↻ Regenerate
                    </button>
                  </div>
                </div>
                
                <div className="question-content">
                  <textarea
                    value={question.text}
                    onChange={e => handleEditQuestion(index, e.target.value)}
                    rows={3}
                  ></textarea>
                </div>
                
                <div className="question-analysis">
                  <h5>AI Analysis:</h5>
                  <p>{question.analysis}</p>
                  
                  {question.expectedInsights && (
                    <div className="expected-insights">
                      <h5>Expected Insights:</h5>
                      <ul>
                        {question.expectedInsights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.relatedSkills && question.relatedSkills.length > 0 && (
                    <div className="related-skills">
                      <h5>Related Skills:</h5>
                      <div className="skill-tags">
                        {question.relatedSkills.map((skill: string, i: number) => (
                          <span key={i} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="questions-actions">
            <button 
              className="save-questions-btn"
              onClick={handleSaveQuestions}
            >
              Save Questions for Interviews
            </button>
            <button 
              className="regenerate-all-btn"
              onClick={handleGenerateQuestions}
            >
              Regenerate All Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestionGenerator;