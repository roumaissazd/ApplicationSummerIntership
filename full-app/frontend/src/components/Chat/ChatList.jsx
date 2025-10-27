// components/Chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewChatModal from './NewChatModal';

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'

  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:5001/api"; // Correction du port

  // Vérifier si le serveur est en ligne
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/test`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (err) {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000); // Vérifier toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      if (serverStatus !== 'online') {
        setError('Le serveur est hors ligne. Veuillez démarrer le serveur backend.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/chat/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des conversations:', err);
        
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
          setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 5001.');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchConversations();
    } else {
      setError('Vous devez être connecté pour accéder aux conversations.');
      setLoading(false);
    }
  }, [token, serverStatus]);

  const handleNewChat = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setShowNewChatModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Messages</h2>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {serverStatus === 'online' ? 'En ligne' : 'Hors ligne'}
            </span>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
              title="Nouvelle conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
              <div className="mt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded mr-2"
                >
                  Actualiser
                </button>
                {serverStatus === 'offline' && (
                  <button
                    onClick={() => window.open('http://localhost:5001/api/test', '_blank')}
                    className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded"
                  >
                    Vérifier le serveur
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              Vous n'avez pas encore de conversation. Commencez à discuter avec d'autres utilisateurs !
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nouvelle conversation
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map(conversation => (
              <li key={conversation._id} className="hover:bg-gray-50 transition-colors">
                <Link
                  to={`/chat/${conversation._id}`}
                  className="block p-4"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {conversation.participants && conversation.participants[0] ? 
                          `${conversation.participants[0].firstName.charAt(0)}${conversation.participants[0].lastName.charAt(0)}` : 
                          'U'
                        }
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participants && conversation.participants.length > 0 ? 
                            conversation.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ') : 
                            'Conversation'
                          }
                        </p>
                        {conversation.lastMessage && (
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(conversation.lastMessage.timestamp),
                              { addSuffix: true, locale: fr }
                            )}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage ? (
                          <>
                            <span className="font-medium">
                              {conversation.lastMessage.sender ? conversation.lastMessage.sender.firstName : 'Quelquun'}:
                            </span> {conversation.lastMessage.content}
                          </>
                        ) : (
                          "Aucun message"
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onConversationCreated={handleNewChat}
        />
      )}
    </div>
  );
};

export default ChatList;