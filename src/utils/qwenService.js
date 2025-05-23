const axios = require('axios');
const config = require('../config');

/**
 * Call Qwen API
 * @param {string} prompt - User input prompt
 * @param {object} options - Optional parameters like temperature, max tokens etc.
 * @returns {Promise<object>} - API response
 */
async function callQwenApi(prompt, options = {}) {
  // Default parameters
  const defaultOptions = {
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 0.9
  };
  
  // Merge default parameters and user parameters
  const params = { ...defaultOptions, ...options };
  
  try {
    // Build request body
    const requestBody = {
      model: config.qwen.model,
      input: {
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      parameters: {
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        top_p: params.top_p
      }
    };
    
    console.log('Calling Qwen API, URL:', config.qwen.apiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Send request to Qwen API
    const response = await axios.post(
      config.qwen.apiUrl,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.qwen.apiKey}`
        }
      }
    );
    
    console.log('API response status:', response.status);
    console.log('API response data:', JSON.stringify(response.data, null, 2));

    // Ensure correct response structure
    if (response.data && response.data.output) {
      // Already in correct structure
      return response.data;
    } else if (response.data && response.data.choices && response.data.choices.length > 0) {
      // Convert alternative API structure to expected format
      return {
        output: {
          finish_reason: response.data.choices[0].finish_reason || "stop",
          text: response.data.choices[0].message.content
        }
      };
    } else {
      // Return original structure if unrecognized
      return response.data;
    }

  } catch (error) {
    // Catch and handle errors
    console.error('Error calling Qwen API:', error.message);
    if (error.response) {
      console.error('API error details:', error.response.data);
      return { error: error.response.data, status: error.response.status };
    }
    console.error('Full error:', error);
    return { error: error.message };
  }
}

module.exports = { callQwenApi };