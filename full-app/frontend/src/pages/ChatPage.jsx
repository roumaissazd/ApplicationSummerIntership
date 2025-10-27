// pages/ChatPage.jsx
import React from 'react';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { useParams } from 'react-router-dom';

const ChatPage = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200">
        <ChatList />
      </div>
      <div className="hidden md:flex md:w-2/3 lg:w-3/4">
        {conversationId ? (
          <ChatWindow />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">Bienvenue dans le chat</p>
              <p className="text-sm text-gray-500 mb-4">Sélectionnez une conversation pour commencer à discuter</p>
              <p className="text-xs text-gray-400">Ou créez une nouvelle conversation en cliquant sur le bouton +</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;