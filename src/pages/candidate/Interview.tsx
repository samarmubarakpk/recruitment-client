import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
interface Question {
  id: number;
  text: string;
  type: 'technical' | 'behavioral' | 'situational';
  aiAnalysisPoints: string[];
}

interface InterviewData {
  id: number;
  vacancyId: number;
  vacancyTitle: string;
  company: string;
  questions: Question[];
  duration: number; // in minutes
}

const Interview: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [recording, setRecording] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false);
  
  // References for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        // Fetch interview details
        const response = await api.get(`/interviews/${interviewId}`);
        setInterviewData(response.data);
        setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      } catch (err) {
        console.error('Error fetching interview data:', err);
        setError('Failed to load interview data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
    
    // Cleanup function to stop media streams when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [interviewId]);
  
  // Timer countdown for the interview
  useEffect(() => {
    let timer: number;
    
    if (recording && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Force end interview if time runs out
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [recording, timeLeft]);
  
  const setupMediaRecording = async () => {
    try {
      // Request access to webcam and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      
      // Display video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Please allow access to your camera and microphone to proceed with the interview.');
      return false;
    }
  };
  
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      chunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Collect chunks every second
      setRecording(true);
    }
  };
  
  const stopRecording = async (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          chunksRef.current = [];
          resolve(blob);
        };
        mediaRecorderRef.current.stop();
        setRecording(false);
      } else {
        // Return empty blob if not recording
        resolve(new Blob([], { type: 'video/webm' }));
      }
    });
  };
  
  const handleStartInterview = async () => {
    const success = await setupMediaRecording();
    if (success) {
      startRecording();
    }
  };
  
  const handleNextQuestion = async () => {
    if (!interviewData) return;
    
    // Save current question response
    const currentQuestionId = interviewData.questions[currentQuestionIndex].id;
    
    // Stop recording for this question
    const recordingBlob = await stopRecording();
    
    // Create form data to upload video
    const formData = new FormData();
    formData.append('video', recordingBlob, `question_${currentQuestionId}.webm`);
    formData.append('interviewId', interviewId || '');
    formData.append('questionId', currentQuestionId.toString());
    
    try {
      // Upload the recording
      await api.post('/interviews/answer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add to answered questions
      setAnsweredQuestions(prev => [...prev, currentQuestionId]);
      
      // Move to next question or end interview
      if (currentQuestionIndex < interviewData.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        startRecording(); // Start recording next question
      } else {
        handleEndInterview();
      }
    } catch (err) {
      console.error('Error uploading answer:', err);
      setError('Failed to save your answer. Please try again.');
    }
  };
  
  const handleEndInterview = async () => {
    // Stop any ongoing recording
    if (recording) {
      await stopRecording();
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      // Mark interview as completed
      await api.post(`/interviews/${interviewId}/complete`);
      setInterviewComplete(true);
    } catch (err) {
      console.error('Error completing interview:', err);
      setError('Failed to complete the interview. Please contact support.');
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return <div className="loading">Loading interview...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!interviewData) {
    return <div className="error-message">Interview not found.</div>;
  }
  
  if (interviewComplete) {
    return (
      <div className="interview-complete">
        <h2>Interview Completed</h2>
        <p>Thank you for completing the interview for <strong>{interviewData.vacancyTitle}</strong> at <strong>{interviewData.company}</strong>.</p>
        <p>Your responses have been recorded and will be analyzed by our AI system.</p>
        <p>The hiring team at {interviewData.company} will review your interview and get back to you soon.</p>
        <button onClick={() => navigate('/candidate-dashboard')}>Return to Dashboard</button>
      </div>
    );
  }
  
  const currentQuestion = interviewData.questions[currentQuestionIndex];

  return (
    <div className="interview-container">
      <div className="interview-header">
        <h2>Interview: {interviewData.vacancyTitle}</h2>
        <p className="company-name">Company: {interviewData.company}</p>
        <div className="interview-timer">Time Remaining: {formatTime(timeLeft)}</div>
        <div className="question-progress">
          Question {currentQuestionIndex + 1} of {interviewData.questions.length}
        </div>
      </div>
      
      <div className="interview-body">
        <div className="video-container">
          {!recording ? (
            <div className="video-placeholder">
              <p>Click "Start Interview" to begin</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline
              className="video-preview"
            ></video>
          )}
        </div>
        
        <div className="question-container">
          {recording ? (
            <>
              <div className="question-type">{currentQuestion.type.toUpperCase()} QUESTION</div>
              <div className="question-text">{currentQuestion.text}</div>
              <div className="recording-indicator">
                <span className="recording-dot"></span> Recording in progress
              </div>
            </>
          ) : (
            <div className="interview-instructions">
              <h3>Preparing for your AI Interview</h3>
              <p>You'll be asked {interviewData.questions.length} questions related to the position.</p>
              <p>Each response will be recorded and analyzed by our AI system.</p>
              <p>Ensure you're in a quiet environment with good lighting.</p>
              <p>The interview will last approximately {interviewData.duration} minutes.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="interview-controls">
        {!recording ? (
          <button 
            onClick={handleStartInterview}
            className="start-button"
          >
            Start Interview
          </button>
        ) : (
          <>
            <button 
              onClick={handleNextQuestion}
              className="next-button"
            >
              {currentQuestionIndex < interviewData.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </button>
            <button 
              onClick={handleEndInterview}
              className="end-button"
            >
              End Interview Early
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Interview;