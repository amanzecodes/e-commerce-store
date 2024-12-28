import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
  type: { 
    type: String, 
    required: true 
}, 
  message: { 
    type: String, 
    required: true 
},
  data: { 
    type: mongoose.Schema.Types.Mixed // Store additional data like product details
}, 
  isRead: { 
    type: Boolean, 
    default: false 
}, 
  createdAt: { 
    type: Date, 
    default: Date.now 
},
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
