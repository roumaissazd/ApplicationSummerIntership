// services/notificationService.js
class NotificationService {
  static init(io) {
    this.io = io; // Store the shared io instance
    console.log('NotificationService initialized with shared socket.io instance');
  }

  static sendNotification(userId, notification) {
    if (!this.io) {
      console.error('Socket.io not initialized');
      return;
    }
    this.io.to(`user_${userId}`).emit('notification', notification);
    console.log(`Notification sent to user_${userId}:`, notification);
  }
}

module.exports = NotificationService;