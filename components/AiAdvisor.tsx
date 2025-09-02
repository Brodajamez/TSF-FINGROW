import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Transaction, Message } from '../types';
import { createAdvisorChat, generateTransactionsContext } from '../services/geminiService';
import Button from './ui/Button';
import type { Chat } from '@google/genai';
import { GenerateContentResponse } from '@google/genai';

interface AiAdvisorProps {
  transactions: Transaction[];
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const initializeChat = useCallback(() => {
    const newChat = createAdvisorChat();
    setChat(newChat);
    if (newChat) {
      setMessages([
        {
          id: 'init',
          text: 'Hello! I am Finley, your personal AI financial advisor. How can I help you understand your finances today?',
          sender: 'ai',
        },
      ]);
    } else {
      setMessages([
        {
          id: 'init-error',
          text: 'The AI Advisor feature is currently unavailable. Please make sure the API key is configured correctly.',
          sender: 'ai',
        },
      ]);
    }
  }, []);
  
  useEffect(() => {
    initializeChat();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', isLoading: true }]);

    try {
      const transactionsContext = generateTransactionsContext(transactions);
      const fullPrompt = `${transactionsContext}\n\nUser question: ${input}`;
      
      const stream = await chat.sendMessageStream({ message: fullPrompt });

      let currentText = "";
      for await (const chunk of stream) {
        const chunkText: string = chunk.text;
        currentText += chunkText;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: currentText, isLoading: false } : msg
          )
        );
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.', isLoading: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">AI Financial Advisor</h1>
      <div className="flex-1 bg-white rounded-xl shadow-md p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-800'} ${msg.id === 'init-error' ? 'bg-amber-100 text-amber-800' : ''}`}>
                {msg.isLoading ? <div className="dot-flashing"></div> : msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your spending habits..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
          disabled={isLoading || !chat}
        />
        <Button onClick={handleSend} disabled={isLoading || !chat}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
      <style>{`
        .dot-flashing {
          position: relative;
          width: 10px; height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dotFlashing 1s infinite linear alternate;
          animation-delay: .5s;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -15px;
          width: 10px; height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dotFlashing 1s infinite alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 15px;
          width: 10px; height: 10px;
          border-radius: 5px;
          background-color: #9880ff;
          color: #9880ff;
          animation: dotFlashing 1s infinite alternate;
          animation-delay: 1s;
        }
        @keyframes dotFlashing {
          0% { background-color: #8b8b8b; }
          50%, 100% { background-color: #d1d1d1; }
        }
      `}</style>
    </div>
  );
};

export default AiAdvisor;