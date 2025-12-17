import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Processing your image...</p>
        <p className="loading-subtext">This may take a few moments</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;