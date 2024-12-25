import FAQ from '../models/faq.model.js'
export const addFaq = async (req, res) => {
    
        try {
            const { question, answer } = req.body;
            if (!question || !answer) {
                return res.status(400).send({ message: 'Question and answer are required' });
            }
            const newFAQ = new FAQ({ question, answer });
            await newFAQ.save();
            res.status(201).send({ message: 'FAQ created successfully', FAQ: question, Response: answer });
        } catch (error) {
            res.status(500).send({ message: 'An error occurred', error: error.message });
        }
    
}

export const getFaq = async (req, res) => {
    
        try {
            // Here this is typically fetching the FAQ from the database
            const faqs = await FAQ.find();
            res.status(200).send({ message: 'FAQs retrieved successfully', FAQs: faqs });
        } catch (error) {
            res.status(500).send({ message: 'An error occurred', error: error.message });
        }
    
}

export const editFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).send({ message: 'Question and answer are required' });
        }
        const updatedFAQ = await FAQ.findByIdAndUpdate(id, { question, answer }, { new: true });
        if (!updatedFAQ) {
            return res.status(404).send({ message: 'FAQ not found' });
        }
        res.status(200).send({ message: 'FAQ updated successfully', FAQ: question, Response: answer });
    } catch (error) {
        res.status(500).send({ message: 'An error occurred', error: error.message });
    }
}