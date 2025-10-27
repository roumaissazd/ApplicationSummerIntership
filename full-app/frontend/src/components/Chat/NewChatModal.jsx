// components/Chat/NewChatModal.jsx
import React, { useState, useEffect } from 'react';
import UserSearch from './UserSearch';

const NewChatModal = ({ onClose, onConversationCreated }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:5001/api";

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setError('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const participantIds = selectedUsers.map(user => user._id);
      
      const response = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ participantIds })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onConversationCreated(data.conversation);
    } catch (err) {
      console.error('Erreur lors de la création de la conversation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nouvelle conversation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Participants:</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedUsers.map(user => (
              <div key={user._id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                {user.firstName} {user.lastName}
                <button
                  onClick={() => handleUserSelect(user)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <UserSearch onUserSelect={handleUserSelect} selectedUsers={selectedUsers} />

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={loading || selectedUsers.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;