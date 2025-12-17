import React from 'react';

const ImagePreview = ({ image, background, isProcessing }) => {
  const getPreviewStyle = () => {
    if (!image) return {};
    
    if (background.type === 'color') {
      return {
        background: background.value,
      };
    } else if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    } else {
      // Transparent - show checkerboard pattern
      return {
        backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlNWU1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU1ZTUiLz48L3N2Zz4=")`,
        backgroundSize: '20px 20px',
      };
    }
  };

  return (
    <div className="image-preview">
      {image ? (
        <div className="preview-container" style={getPreviewStyle()}>
          <img 
            src={image} 
            alt="Preview" 
            className="preview-image"
            style={{
              opacity: isProcessing ? 0.5 : 1,
            }}
          />
          
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-spinner"></div>
              <p>Processing image...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="preview-placeholder">
          <div className="placeholder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3>No Image Selected</h3>
          <p>Upload an image to get started</p>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;