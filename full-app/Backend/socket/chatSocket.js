const Message = require('../Model/Message');
const Conversation = require('../Model/Conversation');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', socket.id);
    
    // Rejoindre une salle de conversation
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Utilisateur ${socket.id} a rejoint la conversation ${conversationId}`);
    });
    
    // Quitter une salle de conversation
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Utilisateur ${socket.id} a quitté la conversation ${conversationId}`);
    });
    
    // Envoyer un message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content, senderId } = data;
        
        // Créer le message
        const message = new Message({
          conversationId,
          sender: senderId,
          content
        });
        
        await message.save();
        
        // Mettre à jour le dernier message de la conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content,
            sender: senderId,
            timestamp: new Date()
          }
        });
        
        // Récupérer le message avec les infos du sender
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'firstName lastName');
        
        // Envoyer le message à tous les participants de la conversation
        io.to(conversationId).emit('newMessage', populatedMessage);
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('messageError', { error: error.message });
      }
    });
    
    // Marquer un message comme lu
    socket.on('markAsRead', async (data) => {
      try {
        const { messageId, userId } = data;
        
        await Message.findByIdAndUpdate(messageId, {
          $push: { readBy: { user: userId, readAt: new Date() } },
          $set: { read: true }
        });
        
        // Notifier les autres participants que le message a été lu
        socket.to(data.conversationId).emit('messageRead', { messageId, userId });
      } catch (error) {
        console.error('Erreur lors du marquage du message comme lu:', error);
      }
    });
    
    // Indicateur de frappe
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('userTyping', {
        userId: data.userId,
        conversationId: data.conversationId,
        isTyping: data.isTyping
      });
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
      console.log('Utilisateur déconnecté:', socket.id);
    });
  });
};