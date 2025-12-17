import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import BackgroundOptions from './components/BackgroundOptions';
import ImagePreview from './components/ImagePreview';
import LoadingSpinner from './components/LoadingSpinner';
import { removeBackground, API_KEY, testApiKey } from './utils/api';
import './styles/App.css';

// Default background options
const defaultBackgrounds = [
  { id: 'transparent', name: 'Transparent', type: 'transparent', value: 'transparent', thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZmZmZiIvPjxwYXRoIGQ9Ik0wIDBoNTB2NTBIMHoiIGZpbGw9IiNlNWU1ZTUiLz48cGF0aCBkPSJNNTAgNTBoNTB2NTBINTB6IiBmaWxsPSIjZTVlNWU1Ii8+PC9zdmc+' },
  { id: 'white', name: 'White', type: 'color', value: '#ffffff', thumbnail: '#' },
  { id: 'black', name: 'Black', type: 'color', value: '#000000', thumbnail: '#' },
  { id: 'gradient', name: 'Gradient', type: 'color', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', thumbnail: '#' },
  { id: 'office', name: 'Office', type: 'image', value: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=100&h=75&fit=crop' },
  { id: 'nature', name: 'Nature', type: 'image', value: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=100&h=75&fit=crop' },
  { id: 'beach', name: 'Beach', type: 'image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=75&fit=crop' },
  { id: 'urban', name: 'Urban', type: 'image', value: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop', thumbnail: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=75&fit=crop' },
];

function App() {
  const [imageState, setImageState] = useState({
    original: null,
    processed: null,
    backgroundRemoved: null,
    compositeImage: null,
  });
  
  const [selectedBackground, setSelectedBackground] = useState(defaultBackgrounds[0]);
  const [processingState, setProcessingState] = useState({
    isLoading: false,
    error: null,
    success: false,
  });
  
  const [apiStatus, setApiStatus] = useState({
    isValid: false,
    credits: null,
    isLoading: true,
  });

    // Test API key on component mount
useEffect(() => {
  const checkApiKey = async () => {
    try {
      setApiStatus(prev => ({ ...prev, isLoading: true }));
      const result = await testApiKey();
      
      // Handle the new return structure
      setApiStatus({
        isValid: result.isValid,
        credits: result.credits,
        isLoading: false,
      });
      
      // Log the result for debugging
      if (result.isValid) {
        console.log('API Status: Valid');
        if (result.credits) {
          console.log(`Credits: ${result.credits.remaining} remaining out of ${result.credits.total}`);
        }
      }
    } catch (error) {
      console.error('API check failed:', error);
      setApiStatus({
        isValid: false,
        credits: null,
        isLoading: false,
      });
    }
  };
  
  checkApiKey();
}, []);

  // Handle image upload
  const handleImageUpload = (file) => {
    // Check file size (limit to 12MB for API)
    if (file.size > 12 * 1024 * 1024) {
      setProcessingState({
        isLoading: false,
        error: 'File too large. Please use an image under 12MB.',
        success: false,
      });
      return;
    }
    
    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setProcessingState({
        isLoading: false,
        error: 'Unsupported file type. Please use JPG, PNG, or WebP images.',
        success: false,
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      setImageState({
        original: result,
        processed: result,
        backgroundRemoved: null,
        compositeImage: null,
      });
      setProcessingState({
        isLoading: false,
        error: null,
        success: false,
      });
    };
    reader.onerror = () => {
      setProcessingState({
        isLoading: false,
        error: 'Failed to read image file. Please try another image.',
        success: false,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle background removal with real API
  const handleRemoveBackground = async () => {
    if (!imageState.original) return;
    
    // Check API status first
    if (!apiStatus.isValid && !apiStatus.isLoading) {
      setProcessingState({
        isLoading: false,
        error: 'API key is not valid. Please check your Remove.bg API key.',
        success: false,
      });
      return;
    }
    
    setProcessingState({
      isLoading: true,
      error: null,
      success: false,
    });
    
    try {
      console.log('Starting background removal process...');
      
      // Use the real API to remove background
      const removedBgImage = await removeBackground(imageState.original);
      
      // Verify the result
      if (!removedBgImage || !removedBgImage.includes('data:image')) {
        throw new Error('Invalid response from background removal service');
      }
      
      setImageState(prev => ({
        ...prev,
        backgroundRemoved: removedBgImage,
        processed: removedBgImage,
        compositeImage: null,
      }));
      
      setSelectedBackground(defaultBackgrounds[0]); // Set to transparent
      
      setProcessingState({
        isLoading: false,
        error: null,
        success: true,
      });
      
    } catch (error) {
      console.error('Background removal error:', error);
      
      let userErrorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('API credits')) {
        userErrorMessage = 'Your Remove.bg credits are exhausted. Please check your account or wait for monthly reset.';
      } else if (error.message.includes('Invalid API key')) {
        userErrorMessage = 'Invalid Remove.bg API key. Please update your API key in src/utils/api.js';
      } else if (error.message.includes('Network error')) {
        userErrorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('timed out')) {
        userErrorMessage = 'Request timed out. Try with a smaller image.';
      }
      
      setProcessingState({
        isLoading: false,
        error: userErrorMessage,
        success: false,
      });
    }
  };

  // Handle background change
  const handleBackgroundChange = (background) => {
    setSelectedBackground(background);
    
    if (background.type === 'transparent' && imageState.backgroundRemoved) {
      setImageState(prev => ({
        ...prev,
        processed: imageState.backgroundRemoved,
        compositeImage: null,
      }));
    } else if ((background.type === 'color' || background.type === 'image') && imageState.backgroundRemoved) {
      // For demo, we'll show the transparent image overlaid
      // In a real app, you'd composite them properly
      setImageState(prev => ({
        ...prev,
        processed: imageState.backgroundRemoved,
        compositeImage: background.value,
      }));
    } else if (!imageState.backgroundRemoved) {
      setImageState(prev => ({
        ...prev,
        processed: imageState.original,
        compositeImage: null,
      }));
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!imageState.processed) return;
    
    try {
      const link = document.createElement('a');
      link.href = imageState.processed;
      link.download = `background-removed-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success feedback
      setProcessingState(prev => ({
        ...prev,
        error: null,
        success: false,
      }));
    } catch (error) {
      console.error('Download error:', error);
      setProcessingState(prev => ({
        ...prev,
        error: 'Failed to download image. Please try again.',
        success: false,
      }));
    }
  };

  // Reset the application
  const handleReset = () => {
    setImageState({
      original: null,
      processed: null,
      backgroundRemoved: null,
      compositeImage: null,
    });
    setSelectedBackground(defaultBackgrounds[0]);
    setProcessingState({
      isLoading: false,
      error: null,
      success: false,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1> Background Changer</h1>
        <p>Remove or replace backgrounds from your images instantly</p>
        <div className="api-status-badge">
          <span className={`status-dot ${apiStatus.isValid ? 'active' : 'inactive'}`}></span>
          <span className="status-text">
            {apiStatus.isLoading ? 'Checking API...' : 
             apiStatus.isValid ? 'Remove.bg API Connected' : 'API Not Connected'}
          </span>
        </div>
      </header>

      <main className="app-main">
        <div className="app-container">
          <div className="upload-section">
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {imageState.original && (
              <div className="action-buttons">
                <button 
                  className="btn btn-primary" 
                  onClick={handleRemoveBackground}
                  disabled={processingState.isLoading || !apiStatus.isValid}
                  title={!apiStatus.isValid ? "API key not configured" : ""}
                >
                  {processingState.isLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      Removing Background...
                    </>
                  ) : 'Remove Background'}
                </button>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={handleReset}
                  disabled={processingState.isLoading}
                >
                  Reset
                </button>
              </div>
            )}
            
            {processingState.error && (
              <div className="error-message">
                <div className="error-icon"></div>
                <div className="error-content">
                  <strong>Error:</strong> {processingState.error}
                  {processingState.error.includes('API key') && (
                    <div className="error-solution">
                      <p>Fix this by:</p>
                      <ol>
                        <li>Going to <a href="https://www.remove.bg/dashboard#api-key" target="_blank" rel="noopener noreferrer">Remove.bg Dashboard</a></li>
                        <li>Copying your API key</li>
                        <li>Updating <code>src/utils/api.js</code> line 5</li>
                        <li>Refreshing this page</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {processingState.success && (
              <div className="success-message">
                <div className="success-icon"></div>
                <div className="success-content">
                  <strong>Success!</strong> Background removed successfully!
                  <p className="success-tip">Now choose a new background from the options below.</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="preview-section">
            <ImagePreview 
              image={imageState.processed} 
              background={selectedBackground}
              isProcessing={processingState.isLoading}
              compositeBg={imageState.compositeImage}
            />
            
            {imageState.processed && (
              <div className="download-section">
                <button 
                  className="btn btn-download" 
                  onClick={handleDownload}
                  disabled={processingState.isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Image
                </button>
                
                {!apiStatus.isValid && (
                  <div className="api-warning">
                    <p>
                       
                      <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer"> Get real API key</a>
                      {' '}for actual background removal.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {imageState.original && (
            <div className="backgrounds-section">
              <h2> Choose Background</h2>
              <p className="section-description">
                {imageState.backgroundRemoved 
                  ? 'Select a background to place behind your subject' 
                  : 'Remove the background first to enable background replacement'}
              </p>
              
              <BackgroundOptions 
                backgrounds={defaultBackgrounds}
                selectedId={selectedBackground.id}
                onSelect={handleBackgroundChange}
                disabled={!imageState.backgroundRemoved}
              />
              
              <div className="api-info">
                <h3>  API Information</h3>
                <div className="api-details">
                  <p><strong>Status:</strong> 
                    <span className={`api-status-indicator ${apiStatus.isValid ? 'valid' : 'invalid'}`}>
                      {apiStatus.isValid ? ' Connected' : ' Not Connected'}
                    </span>
                  </p>
                  <p><strong>Key:</strong> <code>{API_KEY.substring(0, 8)}...{API_KEY.substring(API_KEY.length - 4)}</code></p>
                  
                  {apiStatus.isValid ? (
                    <div className="api-success">
                      <p>  Your Remove.bg API is working correctly!</p>
                      <p className="api-tip">
                        You have 50 free credits per month. 
                        Each background removal uses 1 credit.
                      </p>
                    </div>
                  ) : (
                    <div className="api-setup">
                      <h4>Setup Required:</h4>
                      <ol>
                        <li>Your key <code>{API_KEY}</code> needs to be activated</li>
                        <li>Visit <a href="https://www.remove.bg/dashboard" target="_blank" rel="noopener noreferrer">Remove.bg Dashboard</a></li>
                        <li>Ensure your account is active</li>
                        <li>Refresh this page after activation</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Background Changer • Powered by Remove.bg API</p>
        <p className="footer-note">
          Build and Design by Taofeek Kehinde • All rights Reserved!
        </p>
      </footer>

      {processingState.isLoading && <LoadingSpinner />}
    </div>
  );
}

export default App;