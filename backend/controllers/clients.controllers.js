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
export const removeClient = async(req, res) => {
    try {
        const { id } = req.params;
        const clients = await User.findOneAndDelete(id)
        await User.save();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}