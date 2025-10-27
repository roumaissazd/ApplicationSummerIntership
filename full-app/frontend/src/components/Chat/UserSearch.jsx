// components/Chat/UserSearch.jsx (version de repli)
import React, { useState, useEffect } from 'react';

const UserSearch = ({ onUserSelect, selectedUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = "http://localhost:5001/api";

  // Charger tous les utilisateurs au montage du composant
  useEffect(() => {
    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Impossible de charger les utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [token]);

  // Filtrer les utilisateurs lorsque le terme de recherche change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers([]);
      setError(null);
      return;
    }

    // Ne pas rechercher si le terme est trop court
    if (searchTerm.trim().length < 2) {
      setFilteredUsers([]);
      setError('Veuillez entrer au moins 2 caractères');
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user => 
      !selectedUsers.some(selected => selected._id === user._id) &&
      (
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    );
    
    setFilteredUsers(filtered);
    setError(null);
  }, [searchTerm, allUsers, selectedUsers]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Rechercher des utilisateurs (min. 2 caractères)..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {loading && (
        <div className="mt-2 flex justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              onClick={() => onUserSelect(user)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold mr-3">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && searchTerm.trim() !== '' && searchTerm.trim().length >= 2 && filteredUsers.length === 0 && (
        <div className="mt-2 text-sm text-gray-500 text-center">
          Aucun utilisateur trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default UserSearch;