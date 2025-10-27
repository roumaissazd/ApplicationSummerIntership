// components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Message from './Message';
import MessageInput from './MessageInput';
import io from 'socket.io-client';

const ChatWindow = () => {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'disconnected', 'connecting'
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:5001";
  const SOCKET_URL = "http://localhost:5001"; // Correction du port

  useEffect(() => {
    if (!conversationId) return;

    // Initialiser la connexion Socket.IO
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'] // Ajouter les transports pour la compatibilité
    });

    newSocket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      setConnectionStatus('connected');
      newSocket.emit('joinConversation', conversationId);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
      setConnectionStatus('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
      setConnectionStatus('disconnected');
      setError('Impossible de se connecter au serveur de chat. Vérifiez que le serveur est en ligne.');
    });

    newSocket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userTyping', ({ userId, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return [...prev.filter(id => id !== userId), userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leaveConversation', conversationId);
      newSocket.disconnect();
    };
  }, [conversationId, token]);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/chat/conversations/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Erreur lors de la récupération de la conversation:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, token]);

  useEffect(() => {
    // Faire défiler vers le bas lorsque de nouveaux messages arrivent
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('sendMessage', {
        conversationId,
        content,
        senderId: JSON.parse(atob(token.split('.')[1])).id // Extraire l'ID du token
      });
    } else {
      setError('Impossible d\'envoyer le message. Vérifiez votre connexion.');
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('typing', {
        conversationId,
        userId: JSON.parse(atob(token.split('.')[1])).id,
        isTyping
      });
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/chat/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId })
      });
    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err);
    }
  };

  useEffect(() => {
    if (conversationId) {
      markMessagesAsRead();
    }
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500">Conversation non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* En-tête de la conversation */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {conversation.participants[0].firstName.charAt(0)}
                {conversation.participants[0].lastName.charAt(0)}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {conversation.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
              </h3>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <p className="text-sm text-gray-500">
                  {connectionStatus === 'connected' 
                    ? (typingUsers.length > 0 
                        ? `${typingUsers.length} utilisateur(s) en train d'écrire...`
                        : 'En ligne'
                      )
                    : 'Hors ligne'
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Aucun message. Soyez le premier à écrire !</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <Message
                key={message._id}
                message={message}
                isOwn={message.sender._id === JSON.parse(atob(token.split('.')[1])).id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Champ de saisie */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {connectionStatus === 'disconnected' && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            La connexion au serveur de chat est perdue. Les messages ne seront pas envoyés en temps réel.
          </div>
        )}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
    </div>
  );
};

export default ChatWindow;