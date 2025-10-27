// components/Chat/Message.jsx
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Message = ({ message, isOwn }) => {
  const messageClass = isOwn 
    ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
    : 'bg-white text-gray-800 rounded-r-lg rounded-tl-lg border border-gray-200';
  
  const containerClass = isOwn 
    ? 'flex justify-end' 
    : 'flex justify-start';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className={`${messageClass} px-4 py-2 shadow`}>
          {!isOwn && (
            <p className="text-xs font-semibold mb-1 opacity-75">
              {message.sender.firstName} {message.sender.lastName}
            </p>
          )}
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;