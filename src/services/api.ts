// src/services/api.ts
import mockApi from './mockApi';

// Use the mock API for now
export const userService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id: number) => Promise.resolve({ data: {} }),
  create: (user: any) => mockApi.register(user),
  update: (id: number, user: any) => Promise.resolve({ data: {} }),
  delete: (id: number) => Promise.resolve({ data: {} })
};

export const companyService = {
  getAll: () => Promise.resolve({ data: [] }),
  getById: (id: number) => Promise.resolve({ data: {} }),
  create: (company: any) => Promise.resolve({ data: {} }),
  update: (id: number, company: any) => Promise.resolve({ data: {} }),
  delete: (id: number) => Promise.resolve({ data: {} })
};

export const vacancyService = {
  getAll: () => mockApi.getVacancies(),
  getById: (id: number) => Promise.resolve({ data: {} }),
  create: (vacancy: any) => Promise.resolve({ data: {} }),
  update: (id: number, vacancy: any) => Promise.resolve({ data: {} }),
  delete: (id: number) => Promise.resolve({ data: {} })
};

// Create a mock version of axios-like API
const api = {
  get: async (url: string) => {
    // Route the URL to the appropriate mock endpoint
    if (url === '/candidate/profile') {
      return { data: await mockApi.getCandidateProfile() };
    }
    if (url === '/vacancies') {
      return { data: await mockApi.getVacancies() };
    }
    if (url === '/candidate/interviews') {
      return { data: [] }; // Return empty array for now
    }
    if (url === '/company/vacancies') {
      return { data: await mockApi.getCompanyVacancies() };
    }
    if (url.match(/\/vacancies\/\d+\/candidates/)) {
      const vacancyId = parseInt(url.split('/')[2]);
      return { data: await mockApi.getCandidatesForVacancy(vacancyId) };
    }
    if (url.match(/\/vacancies\/\d+\/ai-model/)) {
      const vacancyId = parseInt(url.split('/')[2]);
      return { data: await mockApi.getAIModelStatus(vacancyId) };
    }
    if (url.match(/\/vacancies\/\d+\/training-progress/)) {
      const vacancyId = parseInt(url.split('/')[2]);
      return { data: await mockApi.getTrainingProgress(vacancyId) };
    }
    if (url.match(/\/interviews\/\d+/)) {
      const interviewId = url.split('/')[2];
      return { data: await mockApi.getInterviewData(interviewId) };
    }
    if (url.match(/\/cv-analysis\/\d+\/\d+/)) {
      const parts = url.split('/');
      const vacancyId = parseInt(parts[2]);
      const candidateId = parseInt(parts[3]);
      return { data: await mockApi.getCVAnalysis(vacancyId, candidateId) };
    }
    if (url.match(/\/interview-reports\/\d+\/\d+/)) {
      const parts = url.split('/');
      const vacancyId = parts[2];
      const candidateId = parts[3];
      return { data: await mockApi.getInterviewReport(vacancyId, candidateId) };
    }
    if (url.match(/\/interviews\/generation-progress\/.+/)) {
      const taskId = url.split('/').pop() || '';
      return { data: await mockApi.getGenerationProgress(taskId) };
    }
    if (url.match(/\/vacancies\/\d+/)) {
      const vacancyId = parseInt(url.split('/')[2]);
      // For individual vacancy data
      return { data: (await mockApi.getVacancies()).find((v: any) => v.id === vacancyId) || {} };
    }
    
    return { data: {} };
  },
  
  post: async (url: string, data?: any, config?: any) => {
    if (url === '/auth/register') {
      const result = await mockApi.register(data);
      return { data: result };
    }
    if (url === '/auth/login') {
      const result = await mockApi.login(data.email, data.password);
      return { data: result };
    }
    if (url === '/candidate/upload-cv') {
      const result = await mockApi.uploadCV(data);
      return { data: result };
    }
    if (url.match(/\/vacancies\/\d+\/train-model/)) {
      const vacancyId = parseInt(url.split('/')[2]);
      return { data: await mockApi.trainAIModel(vacancyId) };
    }
    if (url.match(/\/vacancies\/\d+\/analyze-cv\/\d+/)) {
      const parts = url.split('/');
      const vacancyId = parseInt(parts[2]);
      const candidateId = parseInt(parts[4]);
      return { data: await mockApi.analyzeCandidateCV(vacancyId, candidateId) };
    }
    if (url === '/interviews/generate-questions') {
      return { data: await mockApi.generateInterviewQuestions(data) };
    }
    
    return { data: {} };
  },
  
  delete: async (url: string) => {
    return { data: {} };
  },
  
  put: async (url: string, data?: any) => {
    return { data: {} };
  }
};

export default api;