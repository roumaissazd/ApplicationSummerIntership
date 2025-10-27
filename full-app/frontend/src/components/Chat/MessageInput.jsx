// components/Chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (!disabled) {
      // Gérer l'indicateur de frappe
      if (!isTyping) {
        setIsTyping(true);
        onTyping(true);
      }
      
      // Réinitialiser le timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Arrêter l'indicateur de frappe après 1 seconde d'inactivité
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder={disabled ? "Connexion perdue..." : "Écrivez un message..."}
          className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled 
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
              : 'border-gray-300'
          }`}
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={`ml-2 rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors ${
          disabled || !message.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;