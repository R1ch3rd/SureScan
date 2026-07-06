import React, { useState, useRef, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { Send, User, Bot, Paperclip, Mic, Info } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';


interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your medical assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isFileProcessed, setIsFileProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Replace with your actual API endpoint for processing PDFs
      const response = await axios.post(`${API_BASE}/api/process-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsFileProcessed(true);
      
      // Add bot message confirming file was processed
      const botMessage: Message = {
        id: messages.length + 1,
        text: `I've processed "${file.name}". You can now ask me questions about its content.`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing file:', error);
      
      const errorMessage: Message = {
        id: messages.length + 1,
        text: `Sorry, I couldn't process the file. Please try again.`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = inputText;
    setInputText('');
    setIsProcessing(true);

    try {
      // Replace with your actual API endpoint for answering questions
      const response = await axios.post(`${API_BASE}/api/answer-question`, {
        question: currentQuestion,
      });
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: response.data.answer || "I'm not sure about that. Could you provide more details?",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting answer:', error);
      
      // Fallback response if API fails
      const botResponses = [
        "Based on your symptoms, it could be a common migraine. I recommend rest in a dark, quiet room and staying hydrated.",
        "Brain tumors can present with various symptoms including headaches, seizures, and cognitive changes. It's important to consult with a neurologist for proper evaluation.",
        "MRI scans are one of the best tools for detecting brain abnormalities. They use magnetic fields and radio waves to create detailed images of the brain.",
        "If you're experiencing persistent headaches, it's important to track their frequency, duration, and any triggers you notice.",
        "Treatment options for brain tumors depend on the type, size, and location. They may include surgery, radiation therapy, or chemotherapy.",
        "I understand this can be concerning. Would you like me to provide more information about what to expect during a neurological examination?",
        "Regular follow-up scans are important to monitor any changes. Your doctor will recommend an appropriate schedule based on your specific situation."
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-ink">
          Medical Assistant
        </h1>
        <p className="text-ink-muted">
          Ask questions about symptoms, conditions, or get information about brain health
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface rounded-2xl border border-surface-border overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.sender === 'user' 
                        ? 'bg-accent-btn text-white' 
                        : 'bg-cream-deep text-ink'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        message.sender === 'user' 
                          ? 'bg-accent-btn' 
                          : 'bg-accent'
                      }`}>
                        {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {message.sender === 'user' ? 'You' : 'Medical Assistant'}
                        </div>
                        <div className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-surface-border">
            <div className="flex items-center bg-cream-deep rounded-xl p-2">
              <button 
                className="p-2 text-ink-muted hover:text-ink"
                onClick={handleFileSelection}
              >
                <Paperclip size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
              />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your medical question..."
                className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-ink placeholder-gray-500 px-2"
                rows={1}
                disabled={isProcessing}
              />
              <button className="p-2 text-ink-muted hover:text-ink">
                <Mic size={20} />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={inputText.trim() === '' || isProcessing}
                className={`p-2 rounded-lg ${
                  inputText.trim() === '' || isProcessing
                    ? 'text-ink-faint cursor-not-allowed' 
                    : 'bg-accent-btn text-ink'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="hidden lg:block w-64 ml-6 bg-surface-warm rounded-2xl border border-surface-border p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <Info size={16} className="mr-2 text-accent-deep" />
            Helpful Tips
          </h3>
          <div className="space-y-4 text-sm text-ink-muted">
            <div>
              <p className="font-medium text-ink-muted mb-1">Be Specific</p>
              <p>Describe your symptoms in detail including duration and severity.</p>
            </div>
            <div>
              <p className="font-medium text-ink-muted mb-1">Upload Documents</p>
              <p>Upload medical PDFs for the assistant to analyze and reference.</p>
            </div>
            <div>
              <p className="font-medium text-ink-muted mb-1">Emergency</p>
              <p>For medical emergencies, please call emergency services immediately.</p>
            </div>
            {selectedFile && (
              <div>
                <p className="font-medium text-accent-deep mb-1">Document Loaded</p>
                <p className="text-white/80 text-xs truncate">{selectedFile.name}</p>
              </div>
            )}
            <div className="pt-4 border-t border-surface-border">
              <p className="text-xs text-ink-faint">
                This AI assistant provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;