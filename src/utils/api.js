//  U can get your api key from bg remover also am using free subs 

export const API_KEY = '8XsN8ZaAumNikKgGH42NWygH';


export const removeBackground = async (imageData) => {
  try {
    console.log(' Starting background removal with Remove.bg API...');
    console.log(' Using API Key:', API_KEY.substring(0, 6) + '...');
    
    
    const blob = await dataURLtoBlob(imageData);
    console.log(' Image converted to blob, size:', Math.round(blob.size / 1024) + 'KB');
    
    // Create form data
    const formData = new FormData();
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto'); 
    formData.append('format', 'png'); 
    formData.append('bg_color', ''); 
    
    console.log(' Sending to Remove.bg API...');
    

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); 
    
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(' API Response received, status:', response.status);
    
    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        const errorJson = await response.json();
        errorText = errorJson.errors ? JSON.stringify(errorJson.errors[0]) : response.statusText;
      } catch (e) {
        errorText = await response.text();
      }
      
      console.error(' API Error:', {
        status: response.status,
        statusText: response.statusText,
        details: errorText
      });
      
      // Handle specific error cases
      switch (response.status) {
        case 400:
          throw new Error('Invalid image or parameters. Please try a different image.');
        case 402:
          throw new Error('API credits exhausted. Check your Remove.bg account balance.');
        case 403:
          throw new Error('Invalid API key. Please check your Remove.bg API key.');
        case 429:
          throw new Error('Too many requests. Please wait before trying again.');
        case 500:
          throw new Error('Remove.bg server error. Please try again later.');
        default:
          throw new Error(`API error: ${response.status} - ${errorText}`);
      }
    }
    
    // Get the processed image as blob
    const resultBlob = await response.blob();
    console.log(' Result received, size:', Math.round(resultBlob.size / 1024) + 'KB');
    console.log(' Result type:', resultBlob.type);
    
    // Check if result is actually a transparent PNG
    if (resultBlob.type !== 'image/png') {
      console.warn(' Result is not PNG, might not have transparency');
    }
    
    // Convert blob to data URL
    const resultDataUrl = await blobToDataURL(resultBlob);
    
    console.log(' Background successfully removed!');
    return resultDataUrl;
    
  } catch (error) {
    console.error(' Error in background removal:', error);
    
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Try a smaller image or check your connection.');
    }
    
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Re-throw API errors
    throw error;
  }
};


const dataURLtoBlob = async (dataurl) => {
  try {
    
    const parts = dataurl.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    
    const mimeType = parts[0].split(':')[1];
    const binary = atob(parts[1]);
    const array = [];
    
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    
    return new Blob([new Uint8Array(array)], { type: mimeType });
  } catch (error) {
    console.error('Error converting dataURL to blob:', error);
    throw new Error('Invalid image format. Please use JPG, PNG, or WebP images.');
  }
};


const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to process image result'));
    reader.readAsDataURL(blob);
  });
};


export const testApiKey = async () => {
  try {
    console.log('Testing API key...');
    const response = await fetch('https://api.remove.bg/v1.0/account', {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(' API Key is valid!');
      
      
      let creditsInfo = {};
      if (data.data && data.data.credits) {
        
        creditsInfo = {
          total: data.data.credits.total,
          used: data.data.credits.used,
          remaining: data.data.credits.free_credits || data.data.credits.total - data.data.credits.used
        };
      } else if (data.credits) {
        
        creditsInfo = {
          total: data.credits.total || data.credits.available || 50, 
          used: data.credits.used || 0,
          remaining: data.credits.free_credits || data.credits.remaining || 50
        };
      } else {
        
        creditsInfo = { total: 50, used: 0, remaining: 50 };
      }
      
      console.log('Account data:', creditsInfo);
      return { isValid: true, credits: creditsInfo };
    } else {
      console.error(' API Key test failed:', response.status);
      return { isValid: false, credits: null };
    }
  } catch (error) {
    console.error(' API Key test error:', error);
    return { isValid: false, credits: null };
  }
};
