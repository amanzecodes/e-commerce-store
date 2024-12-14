import User from '../models/user.model.js';
import bcrypt from 'bcryptjs'

export const changeSettings = async (req, res) => {
    const userId  = req.user; 
    const { name, email, password } = req.body; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10); 
            user.password = await bcrypt.hash(password, salt);
        }

        
    
        const updatedUser = await user.save();

        res.status(200).json(
            {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
        },)
    } catch (error) {
        console.error("Error updating user details:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}