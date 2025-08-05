import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { FiSend, FiX, FiMessageSquare, FiUser, FiMessageCircle } from 'react-icons/fi';
import './ChatBot.css';

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your OCR assistant. How can I help you with document processing today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // TODO: Replace with your LLM API call
      const response = await callLLMAPI(inputMessage.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const callLLMAPI = async (message) => {
    // TODO: Replace this with your actual LLM API integration
    // Example structure for API call:
    /*
    const response = await fetch('YOUR_LLM_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        message: message,
        context: 'OCR Document Processing Assistant'
      })
    });
    
    const data = await response.json();
    return data.response || data.message;
    */
    
    // Temporary mock response for testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `I understand you said: "${message}". This is a placeholder response. Please integrate your LLM API here.`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chatbot-modal ${isOpen ? 'show' : ''}`}>
      <div className="chatbot-modal-content">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <FiMessageSquare className="me-2" />
            OCR Assistant
          </div>
          <Button 
            variant="link" 
            className="chatbot-close-btn"
            onClick={onClose}
          >
            <FiX />
          </Button>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? <FiUser /> : <FiMessageCircle />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar">
                <FiMessageCircle />
              </div>
              <div className="message-content">
                <div className="message-text">
                  <Spinner animation="border" size="sm" className="me-2" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chatbot-input">
          <Form.Control
            ref={inputRef}
            as="textarea"
            rows={1}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="chatbot-textarea"
          />
          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="chatbot-send-btn"
          >
            <FiSend />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 