// src/services/mockApi.ts
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export {}

// Storage for our "database"
let users: any[] = [];
let vacancies: any[] = [
  {
    id: 1,
    title: "Full-Stack Developer",
    company: "TechCorp",
    description: "We're looking for a full-stack developer with React and Node.js experience.",
    requirements: "React, TypeScript, Node.js, Express, MongoDB, 3+ years experience",
    location: "Remote",
    applicationDeadline: "2025-05-01",
    status: "active",
    applicationCount: 4,
    interviewCount: 2
  },
  {
    id: 2,
    title: "UI/UX Designer",
    company: "DesignStudio",
    description: "Seeking a talented UI/UX designer to create beautiful user experiences.",
    requirements: "Figma, Adobe XD, Sketch, user research, prototyping, 2+ years experience",
    location: "New York, NY",
    applicationDeadline: "2025-04-15",
    status: "active",
    applicationCount: 3,
    interviewCount: 1
  }
];

export const mockApi = {
  // Auth
  register: async (userData: any) => {
    await delay(1000); // Simulate network delay
    const newUser = { 
      id: users.length + 1, 
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    return { success: true, user: newUser };
  },

  login: async (email: string, password: string) => {
    await delay(800);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      return { success: true, user };
    }
    throw new Error('Invalid credentials');
  },

  // Candidate
  getCandidateProfile: async () => {
    await delay(700);
    return {
      name: "John Doe",
      email: "john@example.com",
      hasCv: false
    };
  },

  uploadCV: async (formData: FormData) => {
    await delay(2000); // Longer delay to simulate file upload and processing
    return { success: true };
  },

  getVacancies: async () => {
    await delay(600);
    return vacancies;
  },

  // Company
  getCompanyVacancies: async () => {
    await delay(800);
    return vacancies;
  },

  getCandidatesForVacancy: async (vacancyId: number) => {
    await delay(1000);
    return {
      candidates: [
        {
          id: 101,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          matchScore: 85,
          cvAnalysisStatus: "completed",
          interviewStatus: "completed",
          interviewScore: 78
        },
        {
          id: 102,
          name: "Michael Smith",
          email: "michael@example.com",
          matchScore: 72,
          cvAnalysisStatus: "completed",
          interviewStatus: "scheduled"
        },
        {
          id: 103,
          name: "Emma Brown",
          email: "emma@example.com",
          matchScore: 68,
          cvAnalysisStatus: "pending",
          interviewStatus: "pending"
        }
      ]
    };
  },

  // AI features
  getAIModelStatus: async (vacancyId: number) => {
    await delay(500);
    return {
      trained: vacancyId === 1 ? true : false
    };
  },

  trainAIModel: async (vacancyId: number) => {
    await delay(1000);
    return { taskId: "task-" + Date.now() };
  },

  getTrainingProgress: async (vacancyId: number) => {
    const progress = Math.floor(Math.random() * 100);
    return { progress };
  },

  analyzeCandidateCV: async (vacancyId: number, candidateId: number) => {
    await delay(3000);
    return { success: true };
  },

  getCVAnalysis: async (vacancyId: number, candidateId: number) => {
    await delay(1500);
    return {
      candidateName: "Sarah Johnson",
      vacancyTitle: "Full-Stack Developer",
      matchScore: 85,
      analysisDate: new Date().toISOString(),
      extractedData: {
        personalInfo: {
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "123-456-7890",
          location: "San Francisco, CA",
          linkedIn: "linkedin.com/in/sarahjohnson"
        },
        education: [
          {
            institution: "Stanford University",
            degree: "Master's Degree",
            field: "Computer Science",
            startDate: "2018-09-01",
            endDate: "2020-06-01",
            gpa: "3.8"
          },
          {
            institution: "UCLA",
            degree: "Bachelor's Degree",
            field: "Software Engineering",
            startDate: "2014-09-01",
            endDate: "2018-06-01"
          }
        ],
        experience: [
          {
            company: "TechStart Inc.",
            title: "Senior Frontend Developer",
            location: "San Francisco, CA",
            startDate: "2020-07-01",
            endDate: "",
            description: [
              "Led a team of 5 developers in building a React-based dashboard",
              "Implemented CI/CD pipeline for automated testing and deployment",
              "Reduced page load time by 40% through code optimization"
            ],
            technologies: ["React", "TypeScript", "Redux", "Jest"]
          },
          {
            company: "WebSolutions",
            title: "Junior Developer",
            location: "Los Angeles, CA",
            startDate: "2018-06-01",
            endDate: "2020-06-01",
            description: [
              "Developed and maintained client websites using modern web technologies",
              "Collaborated with design team to implement UI/UX improvements",
              "Built RESTful APIs using Node.js and Express"
            ],
            technologies: ["JavaScript", "HTML/CSS", "Node.js", "Express", "MongoDB"]
          }
        ],
        skills: {
          technical: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Git", "Jest", "CI/CD", "RESTful APIs"],
          softSkills: ["Team Leadership", "Communication", "Problem Solving", "Agile Methodology"],
          languages: [
            { language: "English", proficiency: "Native" },
            { language: "Spanish", proficiency: "Intermediate" }
          ],
          certificates: [
            {
              name: "AWS Certified Developer",
              issuer: "Amazon Web Services",
              date: "2022-01-15"
            }
          ]
        },
        projects: [
          {
            name: "E-commerce Platform",
            description: "A fully functional e-commerce platform with shopping cart and payment integration",
            technologies: ["React", "Node.js", "MongoDB", "Stripe API"],
            url: "github.com/sarahjohnson/ecommerce"
          }
        ]
      },
      vacancyRequirements: {
        requiredSkills: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
        preferredSkills: ["AWS", "CI/CD", "Jest", "Redux"],
        experience: "3+ years of full-stack development experience",
        education: "Bachelor's degree in Computer Science or related field"
      },
      skillMatches: {
        matched: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Jest", "CI/CD"],
        missing: ["Docker"]
      },
      experienceAnalysis: {
        relevantYears: 4,
        relevanceScore: 85,
        keyHighlights: [
          "5 years of combined experience in web development",
          "Led frontend development team",
          "Experience with all required technologies",
          "Experience with CI/CD pipelines"
        ]
      },
      overallAssessment: "Sarah appears to be a strong candidate for the Full-Stack Developer position. She has extensive experience with all the required technologies, plus several preferred skills. Her background in leading a development team is a plus for this role.",
      aiRecommendation: "Recommend proceeding to interview. Candidate has a strong match with the job requirements and relevant experience in similar roles."
    };
  },

  // Interview question generation
  generateInterviewQuestions: async (data: any) => {
    await delay(2000);
    return { taskId: "ques-" + Date.now() };
  },

  getGenerationProgress: async (taskId: string) => {
    await delay(1000);
    // Randomize progress for demo purposes
    const progress = Math.min(100, Math.floor(Math.random() * 100) + 10);
    
    if (progress === 100) {
      return {
        progress,
        status: "completed",
        questions: [
          {
            type: "technical",
            text: "Describe a challenging project where you used React and TypeScript. What specific TypeScript features did you leverage to improve code quality?",
            analysis: "This question assesses the candidate's practical experience with the required technologies.",
            expectedInsights: [
              "Depth of knowledge in React and TypeScript",
              "Problem-solving approach to technical challenges",
              "Understanding of type safety and its benefits"
            ],
            relatedSkills: ["React", "TypeScript", "Problem Solving"]
          },
          {
            type: "behavioral",
            text: "Tell me about a time when you had to meet a tight deadline for a project. How did you manage your time and resources?",
            analysis: "This question evaluates the candidate's time management skills and ability to work under pressure.",
            expectedInsights: [
              "Time management skills",
              "Prioritization abilities",
              "Stress management approach"
            ],
            relatedSkills: ["Time Management", "Project Management", "Communication"]
          },
          {
            type: "situational",
            text: "Imagine you're working on a feature that's behind schedule. The team is suggesting cutting corners on testing to meet the deadline. How would you handle this situation?",
            analysis: "This question examines the candidate's approach to quality vs. deadlines trade-offs.",
            expectedInsights: [
              "Decision-making process",
              "Quality standards",
              "Team collaboration"
            ],
            relatedSkills: ["Decision Making", "Quality Assurance", "Team Collaboration"]
          }
        ]
      };
    }
    
    return {
      progress,
      status: "in_progress"
    };
  },

  getInterviewData: async (interviewId: string) => {
    await delay(1000);
    return {
      id: parseInt(interviewId),
      vacancyId: 1,
      vacancyTitle: "Full-Stack Developer",
      company: "TechCorp",
      questions: [
        {
          id: 1,
          text: "Describe a challenging project where you used React and TypeScript. What specific TypeScript features did you leverage to improve code quality?",
          type: "technical",
          aiAnalysisPoints: ["Focus on practical experience", "Look for specific TypeScript features mentioned", "Assess depth of React knowledge"]
        },
        {
          id: 2,
          text: "Tell me about a time when you had to meet a tight deadline for a project. How did you manage your time and resources?",
          type: "behavioral",
          aiAnalysisPoints: ["Note time management strategies", "Assess prioritization skills", "Look for stress management indicators"]
        },
        {
          id: 3,
          text: "How would you architect a scalable backend API for a high-traffic e-commerce application?",
          type: "technical",
          aiAnalysisPoints: ["Check for database scaling knowledge", "Look for caching strategies", "Assess API design principles"]
        }
      ],
      duration: 15
    };
  },

  getInterviewReport: async (vacancyId: string, candidateId: string) => {
    await delay(2000);
    return {
      candidateName: "Sarah Johnson",
      vacancyTitle: "Full-Stack Developer",
      company: "TechCorp",
      interviewDate: new Date().toISOString(),
      overallScore: 78,
      technicalScore: 82,
      communicationScore: 75,
      confidenceScore: 70,
      relevanceScore: 85,
      bodyLanguageScore: 68,
      questions: [
        {
          id: 1,
          text: "Describe a challenging project where you used React and TypeScript.",
          type: "technical",
          score: 85,
          analysis: {
            relevance: 90,
            confidence: 75,
            technicalAccuracy: 88,
            keywordMatches: ["React", "TypeScript", "interfaces", "type safety"],
            sentimentAnalysis: {
              positive: 0.7,
              negative: 0.1,
              neutral: 0.2
            }
          },
          aiComments: "Candidate demonstrated strong knowledge of React and TypeScript. They provided specific examples of how they've used TypeScript interfaces and generics to improve code quality. Their explanation of component architecture showed depth of understanding."
        },
        {
          id: 2,
          text: "Tell me about a time when you had to meet a tight deadline.",
          type: "behavioral",
          score: 70,
          analysis: {
            relevance: 80,
            confidence: 65,
            sentimentAnalysis: {
              positive: 0.5,
              negative: 0.2,
              neutral: 0.3
            }
          },
          aiComments: "Candidate provided a relevant example of meeting a tight deadline for a client project. Their approach showed good prioritization skills, though they appeared slightly nervous when discussing the stressful aspects of the situation. Response could have included more details about specific strategies employed."
        }
      ],
      aiSummary: "Sarah demonstrated strong technical knowledge, particularly in the areas of React, TypeScript, and web development best practices. Her communication was clear, though she showed some nervousness during behavioral questions. Her responses were relevant and showed good problem-solving skills. Body language was generally positive with good eye contact, though there were some signs of nervousness such as hand fidgeting.",
      strengths: [
        "Strong technical knowledge of React and TypeScript",
        "Clear explanations of complex concepts",
        "Relevant practical experience",
        "Good problem-solving approach"
      ],
      improvementAreas: [
        "Confidence when discussing behavioral situations",
        "More specific examples in some responses",
        "Body language consistency"
      ],
      recommendation: "recommended",
      comparisonRank: {
        percentile: 85,
        totalCandidates: 12
      }
    };
  }
};

export default mockApi;