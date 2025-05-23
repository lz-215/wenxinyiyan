const { callQwenApi } = require('../utils/qwenService');

/**
 * Handle chat request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function chatCompletion(req, res) {
  try {
    const { prompt, options } = req.body;
    
    // Validate request data
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid prompt parameter'
      });
    }
    
    // Call Qwen API
    const response = await callQwenApi(prompt, options || {});
    
    // Check for errors
    if (response.error) {
      return res.status(response.status || 500).json({
        success: false,
        message: 'Failed to call AI model',
        error: response.error
      });
    }
    
    // Return success result
    return res.status(200).json({
      success: true,
      data: response.output
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

module.exports = {
  chatCompletion
};