import React, { useState, useRef, useEffect } from 'react';
import {api} from '../../services/api.js';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get('/chat/history');
        
        if (response.data.success && response.data.data) {
          const historyMessages = response.data.data.flatMap((item) => [
            // User message
            {
              id: `${item.id}-user`,
              text: item.userMessage,
              sender: 'user',
              timestamp: new Date(item.createdAt)
            },
            // Bot message
            {
              id: `${item.id}-bot`,
              text: item.botResponse?.response || 'No response',
              sender: 'bot',
              timestamp: new Date(item.createdAt),
              data: item.botResponse
            }
          ]);

          // Sort by timestamp (oldest first)
          const sortedMessages = historyMessages.sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          
          setMessages(sortedMessages);
          
          // Set suggestions from the last bot message if available
          const lastBotMessage = sortedMessages
            .filter(msg => msg.sender === 'bot' && msg.data?.suggestions)
            .pop();
            
          if (lastBotMessage?.data?.suggestions) {
            setCurrentSuggestions(lastBotMessage.data.suggestions);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        // If no history, set initial greeting
        setMessages([{
          id: 1,
          text: "Hello! I'm your agriculture disease assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          data: {
            suggestions: [
              "Describe symptoms",
              "Common wheat diseases", 
              "Organic treatment options",
              "Disease prevention tips"
            ]
          }
        }]);
        setCurrentSuggestions([
          "Describe symptoms",
          "Common wheat diseases", 
          "Organic treatment options",
          "Disease prevention tips"
        ]);
      }
    };

    fetchChatHistory();
  }, []);

  const sendMessage = async (suggestion = null) => {
    const messageToSend = suggestion || inputMessage;
    
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setCurrentSuggestions([]);
    setIsLoading(true);

    try {
      const response = await api.post('/chat/chat', {
        message: messageToSend
      });

      const botResponse = {
        id: Date.now() + 1,
        text: response.data.data.response,
        sender: 'bot',
        timestamp: new Date(),
        data: response.data.data,
        diseases: response.data.data.diseases || []
      
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Update suggestions from bot response
      if (response.data.data.suggestions) {
        setCurrentSuggestions(response.data.data.suggestions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    // Auto-send when suggestion is clicked
    setTimeout(() => sendMessage(suggestion), 100);
  };

// if(isLoading){
//     return (
//       <div className="flex justify-center items-center min-h-[500px] w-[800px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
//         <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
// }
  return (
    <div className="flex flex-col h-[500px] w-[800px] max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold text-lg">🌱 Disease Assistant</h3>
        <p className="text-sm opacity-90">Ask about plant diseases & treatments</p>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
        style={{ maxHeight: '350px' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-xs ${
                message.sender === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {message.text}
              
              {/* Display disease information if available */}
              {message?.diseases && (
                <div className="mt-2 text-sm border-t pt-2">
                  <p className="font-semibold text-green-700 mb-1">Possible diseases:</p>
                  {message.diseases.slice(0, 3).map((disease, index) => (
                    <div key={index} className="mb-2 p-2 bg-green-50 rounded border">
                      <strong className="text-green-800">{disease.name}</strong>
                      {disease.severity && (
                        <p className="text-xs text-gray-600 italic">{disease.severity}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-1">{disease.primarySymptom}</p>
                      <p className="font-semibold text-green-700">🌿 Organic Treatments:</p>
                      <p  className="text-xs ml-2">• {disease.treatment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Display treatment information if available */}
              {message?.treatment && (
                <div className="mt-2 text-sm border-t pt-2">
                  <div className="mb-2">
                    <p className="font-semibold text-green-700">🌿 Organic Treatments:</p>
                      <p  className="text-xs ml-2">• {message.treatment}</p>
                  
                  </div>
                  <div>
                    {/* <p className="font-semibold text-blue-700">🧪 Chemical Treatments:</p>
                    {message.data.treatments.chemical?.map((treatment, idx) => (
                      <p key={idx} className="text-xs ml-2">• {treatment}</p>
                    ))} */}
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="text-left mb-3">
            <div className="inline-block px-4 py-2 rounded-lg bg-white border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe symptoms or ask about diseases..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            Send
          </button>
        </div>
        
        {/* Quick Suggestions */}
        {currentSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <p className="w-full text-xs text-gray-600 mb-1">Quick suggestions:</p>
            {currentSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="text-xs px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-800 hover:bg-green-200 hover:border-green-400 transition-colors duration-200 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;