import User from '../models/user.model.js';

export const clientsInfo = async(req, res) => {
    try {
        const clients = await User.find({ role: { $in: ['admin', 'customer'] } })
        .select('-password');
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}