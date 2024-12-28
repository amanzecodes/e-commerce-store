import Notification from "../models/notifications.model.js";


export const getNotifications = async (req, res) => {
    const userId = req.user.id;
  
    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      res.status(500).json({
        success: false,
        message: "Error fetching notifications",
        error: error.message,
      });
    }
  };
  

export const markNotificationsAsRead = async (req, res) => {
    const userId = req.user.id;
  
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error.message);
      res.status(500).json({
        success: false,
        message: "Error marking notifications as read",
        error: error.message,
      });
    }
  };