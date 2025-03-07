import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1>Welcome to the Recruitment System</h1>
      <p>This system helps companies find the right candidates through an AI-powered recruitment process.</p>
      
      <div className="features">
        <div className="feature">
          <h3>For Candidates</h3>
          <p>Upload your CV, apply for jobs, and participate in automated interviews.</p>
        </div>
        
        <div className="feature">
          <h3>For Companies</h3>
          <p>Post job vacancies, review applications, and get AI-driven insights on candidates.</p>
        </div>
        
        <div className="feature">
          <h3>For Administrators</h3>
          <p>Manage users, companies, and system settings.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;