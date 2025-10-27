const Conversation = require('../Model/Conversation');
const Message = require('../Model/Message');
const User = require('../Model/User');

// Obtenir toutes les conversations d'un utilisateur
exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.user.id] }
    })
    .populate('participants', 'firstName lastName email')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ updatedAt: -1 });
    
    res.json({ conversations });
  } catch (error) {
    console.error('Erreur getUserConversations:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir une conversation spécifique avec ses messages
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'firstName lastName email');
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    // Récupérer les messages
    const messages = await Message.find({ conversationId: req.params.id })
      .populate('sender', 'firstName lastName')
      .sort({ timestamp: 1 });
    
    res.json({ conversation, messages });
  } catch (error) {
    console.error('Erreur getConversationById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Créer une nouvelle conversation
exports.createConversation = async (req, res) => {
  try {
    const { participantIds } = req.body;
    
    // Ajouter l'utilisateur actuel aux participants
    const participants = [req.user.id, ...participantIds];
    
    // Vérifier si une conversation existe déjà entre ces participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    });
    
    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }
    
    // Créer la nouvelle conversation
    const conversation = new Conversation({ participants });
    await conversation.save();
    
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'firstName lastName email');
    
    res.status(201).json({ conversation: populatedConversation });
  } catch (error) {
    console.error('Erreur createConversation:', error);
    res.status(500).json({ error: error.message });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    
    // Vérifier si la conversation existe et si l'utilisateur est participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    // Créer le message
    const message = new Message({
      conversationId,
      sender: req.user.id,
      content
    });
    
    await message.save();
    
    // Mettre à jour le dernier message de la conversation
    conversation.lastMessage = {
      content,
      sender: req.user.id,
      timestamp: new Date()
    };
    await conversation.save();
    
    // Récupérer le message avec les infos du sender
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName');
    
    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ error: error.message });
  }
};

// Marquer les messages comme lus
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    // Mettre à jour tous les messages non lus de cette conversation
    await Message.updateMany(
      { 
        conversationId, 
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      { 
        $push: { readBy: { user: req.user.id, readAt: new Date() } },
        $set: { read: true }
      }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur markMessagesAsRead:', error);
    res.status(500).json({ error: error.message });
  }
};