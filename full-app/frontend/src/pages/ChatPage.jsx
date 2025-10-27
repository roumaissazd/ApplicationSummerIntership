// pages/ChatPage.jsx
import React, { useState, useEffect } from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Users } from 'lucide-react';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [activeConversation, setActiveConversation] = useState(conversationId);

  // Détecter si l'écran est mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Gérer la sélection de conversation sur mobile
  useEffect(() => {
    if (isMobile && conversationId) {
      setShowChatList(false);
    }
  }, [isMobile, conversationId]);

  const handleBackToList = () => {
    setShowChatList(true);
    navigate('/chat');
  };

  const handleConversationSelect = (id) => {
    setActiveConversation(id);
    if (isMobile) {
      setShowChatList(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Panneau latéral - Liste des conversations */}
      <div className={`${isMobile ? (showChatList ? 'w-full' : 'hidden') : 'w-full md:w-1/3 lg:w-1/4 xl:w-1/5'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6" />
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
            <div className="flex items-center space-x-1">
              <div className="relative">
                <div className="absolute top-0 right-0 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatList onConversationSelect={handleConversationSelect} activeConversation={activeConversation} />
        </div>
      </div>

      {/* Fenêtre de chat */}
      <div className={`${isMobile ? (showChatList ? 'hidden' : 'w-full') : 'hidden md:flex md:w-2/3 lg:w-3/4 xl:w-4/5'} bg-white flex flex-col transition-all duration-300 ease-in-out`}>
        {conversationId ? (
          <ChatWindow onBackToList={isMobile ? handleBackToList : null} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-md w-full text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-500 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Bienvenue dans le chat</h2>
                <p className="text-gray-600 mb-6">
                  Sélectionnez une conversation pour commencer à discuter avec vos collègues
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span>OU</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/chat')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Users className="h-5 w-5" />
                    <span>Créer une nouvelle conversation</span>
                  </button>
                </div>
                
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-gray-500">Disponibilité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Instant</div>
                    <div className="text-xs text-gray-500">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Sécurisé</div>
                    <div className="text-xs text-gray-500">Chiffré</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bouton flottant pour retourner à la liste sur mobile */}
      {isMobile && !showChatList && (
        <button
          onClick={handleBackToList}
          className="fixed bottom-6 left-6 z-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Retour à la liste des conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ChatPage;