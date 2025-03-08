// src/components/Placeholder.tsx
import React from 'react';

interface PlaceholderProps {
  componentName: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ componentName }) => {
  return (
    <div style={{ 
      padding: '2rem', 
      margin: '1rem', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      textAlign: 'center' 
    }}>
      <h2>Coming Soon: {componentName}</h2>
      <p>This component is currently in development.</p>
    </div>
  );
};

export default Placeholder;