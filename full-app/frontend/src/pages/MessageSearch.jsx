// Composant MessageSearch
import React, { useState } from 'react';

const MessageSearch = ({ messages, onMessageSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = messages.filter(message =>
      message.content.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Rechercher dans la conversation..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {searchResults.length > 0 && (
        <div className="mt-2 max-h-40 overflow-y-auto">
          {searchResults.map(message => (
            <div
              key={message._id}
              onClick={() => onMessageSelect(message)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
            >
              <p className="text-sm text-gray-600">
                {message.sender.firstName}: {message.content.substring(0, 50)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;