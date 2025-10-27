// components/Chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import UnicodeEmojiPicker from './UnicodeEmojiPicker';

const MessageInput = ({ onSendMessage, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      // Remplacer les raccourcis par des émojis avant d'envoyer
      const messageWithEmojis = replaceShortcodes(message.trim());
      onSendMessage(messageWithEmojis);
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

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const newText = message.substring(0, start) + emoji + message.substring(end);
    
    setMessage(newText);
    
    // Remettre le focus sur l'input et positionner le curseur après l'émoji
    setTimeout(() => {
      input.focus();
      const newPosition = start + emoji.length;
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Envoyer le message avec Entrée (mais pas avec Shift+Entrée pour sauter une ligne)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Support des raccourcis clavier pour les émojis
  const replaceShortcodes = (text) => {
    const shortcodeMap = {
      ':)': '😊',
      ':-)': '😊',
      ':(': '😢',
      ':-(': '😢',
      ':D': '😃',
      ':-D': '😃',
      ':P': '😛',
      ':-P': '😛',
      ';)': '😉',
      ';-)': '😉',
      ':o': '😮',
      ':-o': '😮',
      '<3': '❤️',
      '</3': '❤️',
      ':*': '😘',
      ':-*': '😘',
      ':/': '😕',
      ':-/': '😕',
      ':|': '😐',
      ':-|': '😐',
      ':x': '😡',
      ':-x': '😡',
    };

    let newText = text;
    Object.keys(shortcodeMap).forEach(shortcode => {
      const regex = new RegExp(escapeRegExp(shortcode), 'g');
      newText = newText.replace(regex, shortcodeMap[shortcode]);
    });

    return newText;
  };

  // Fonction utilitaire pour échapper les caractères spéciaux dans les regex
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 p-3 bg-white border-t border-gray-200">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Joindre un fichier"
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L15.172 7zM17.657 4.929a4 4 0 00-5.657 0l-6.415 6.585a6 6 0 108.486 8.486L17.657 4.929z" />
        </svg>
      </button>
      
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Connexion perdue..." : "Écrivez un message... (essayer :) pour 😊)"}
          className={`w-full px-4 py-2 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled 
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed' 
              : 'border-gray-300'
          }`}
          disabled={disabled}
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            resize: 'none'
          }}
          onInput={(e) => {
            // Ajuster la hauteur en fonction du contenu
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
      </div>
      
      <UnicodeEmojiPicker 
        onEmojiSelect={handleEmojiSelect}
        buttonClassName={disabled ? "opacity-50 cursor-not-allowed" : ""}
      />
      
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={`rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors ${
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