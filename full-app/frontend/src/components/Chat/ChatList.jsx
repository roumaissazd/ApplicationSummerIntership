// components/Chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import NewChatModal from './NewChatModal';
import { Plus, Search, Check, CheckCheck, MessageSquare } from 'lucide-react'; // Ajoutez MessageSquare ici

const ChatList = ({ onConversationSelect, activeConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:5001/api";

  // Vérifier si le serveur est en ligne
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
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
    const interval = setInterval(checkServerStatus, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Récupérer les conversations
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

  // Filtrer les conversations en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conversation => {
      if (!conversation.participants || conversation.participants.length === 0) return false;
      
      return conversation.participants.some(participant => 
        participant.firstName.toLowerCase().includes(query) ||
        participant.lastName.toLowerCase().includes(query) ||
        (conversation.lastMessage && conversation.lastMessage.content.toLowerCase().includes(query))
      );
    });
    
    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleNewChat = (newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
    setShowNewChatModal(false);
    if (onConversationSelect) {
      onConversationSelect(newConversation._id);
    }
  };

  const handleConversationClick = (conversationId) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-500">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre de recherche */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Bouton nouvelle conversation */}
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={() => setShowNewChatModal(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle conversation</span>
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-3 m-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded mr-2"
                >
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center">
              {searchQuery 
                ? `Aucune conversation ne correspond à "${searchQuery}"`
                : 'Vous n\'avez pas encore de conversation. Commencez à discuter avec d\'autres utilisateurs !'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map(conversation => (
              <li key={conversation._id}>
                <Link
                  to={`/chat/${conversation._id}`}
                  onClick={() => handleConversationClick(conversation._id)}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    activeConversation === conversation._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                        {conversation.participants && conversation.participants[0] ? 
                          `${conversation.participants[0].firstName.charAt(0)}${conversation.participants[0].lastName.charAt(0)}` : 
                          'U'
                        }
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
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
                      <div className="flex items-center justify-between">
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
                        {conversation.lastMessage && (
                          <div className="ml-2">
                            {conversation.lastMessage.read ? (
                              <CheckCheck className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Check className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
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