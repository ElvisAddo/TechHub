const Answer = require('../models/Answer');
const Question = require('../models/Question');

// @desc    Add an answer
// @route   POST /api/questions/:questionId/answers
// @access  Private
const addAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const question = await Question.findById(req.params.questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = new Answer({
            content,
            user: req.user._id,
            question: question._id
        });

        const createdAnswer = await answer.save();
        
        // Add answer to question's answers array
        question.answers.push(createdAnswer._id);
        await question.save();

        // Populate user details
        await createdAnswer.populate('user', 'username');
        
        res.status(201).json(createdAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
const updateAnswer = async (req, res) => {
    try {
        const { content } = req.body;
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check if user is the owner of the answer
        if (answer.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorised to answer this question' });
        }

        answer.content = content || answer.content;
        const updatedAnswer = await answer.save();
        
        res.json(updatedAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);

        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Check if user is the owner of the answer or an admin
        if (answer.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Remove answer from question's answers array
        await Question.updateOne(
            { _id: answer.question },
            { $pull: { answers: answer._id } }
        );

        await answer.deleteOne();
        res.json({ message: 'Answer removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addAnswer,
    updateAnswer,
    deleteAnswer
};