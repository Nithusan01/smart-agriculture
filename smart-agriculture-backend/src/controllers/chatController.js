const chatbotService = require('../services/chatbotServices');
const Disease = require('../models/disease');

exports.chat = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const userId = req.user?.id; // From auth middleware

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const response = await chatbotService.processMessage(message, context, userId);

    res.json({
      success: true,
      data: response
      
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
};

exports.getDiseaseInfo = async (req, res) => {
  try {
    const { diseaseName } = req.params;
    
    
    const disease = await Disease.findOne({
      where: {
        name: {
          [Op.iLike]: `%${diseaseName}%`
        }
      }
    });

    if (!disease) {
      return res.status(404).json({
        success: false,
        error: 'Disease not found'
      });
    }

    res.json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('Error fetching disease info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disease information'
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 10 } = req.query;

    const history = await chatbotService.getUserChatHistory(userId, parseInt(limit));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
};