import React from 'react';

const BackgroundOptions = ({ backgrounds, selectedId, onSelect, disabled }) => {
  return (
    <div className="background-options">
      {backgrounds.map((bg) => (
        <div 
          key={bg.id}
          className={`background-option ${selectedId === bg.id ? 'selected' : ''} ${disabled && bg.id !== 'transparent' ? 'disabled' : ''}`}
          onClick={() => {
            if (!disabled || bg.id === 'transparent') {
              onSelect(bg);
            }
          }}
          title={disabled && bg.id !== 'transparent' ? "Remove background first to enable this option" : ""}
        >
          <div className="option-thumbnail">
            {bg.type === 'color' ? (
              <div 
                className="color-thumbnail" 
                style={{ background: bg.value }}
              ></div>
            ) : bg.type === 'transparent' ? (
              <div 
                className="transparent-thumbnail"
                style={{ 
                  backgroundImage: `url("${bg.thumbnail}")`,
                  backgroundSize: 'cover'
                }}
              ></div>
            ) : (
              <>
                <img 
                  src={bg.thumbnail} 
                  alt={bg.name}
                  className="image-thumbnail"
                />
                {disabled && bg.id !== 'transparent' && (
                  <div className="option-overlay">
                    <span>Remove BG First</span>
                  </div>
                )}
              </>
            )}
          </div>
          <span className="option-name">{bg.name}</span>
        </div>
      ))}
    </div>
  );
};

export default BackgroundOptions;