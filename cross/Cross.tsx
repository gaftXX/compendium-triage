import React, { useState } from 'react';

interface CrossProps {
  className?: string;
}

export const Cross: React.FC<CrossProps> = ({ className }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div 
      className={className}
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter your note here..."
        style={{
          width: '400px',
          height: '30px',
          padding: '0px 12px',
          fontSize: '14px',
          border: 'none',
          borderRadius: '0px',
          outline: 'none',
          backgroundColor: '#B3E5FC',
          color: '#000000',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
        }}
      />
    </div>
  );
};

export default Cross;
