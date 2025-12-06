const Question = require('../models/Question');
const Category = require('../models/Category');
const Answer = require('../models/Answer');

// @desc    Get questions by category
// @route   GET /api/questions/category/:categoryId
// @access  Public
const getQuestionsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const questions = await Question.find({ category: categoryId })
            .populate('user', 'username')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        
        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res) => {
    try {
        const { title, content, category } = req.body;


        const categoryExists = await Category.findById(category);

        if(!categoryExists) {
            return res.status(404).json({ message : 'Question category does not exist'})
        }
        
        const question = new Question({
            title,
            content,
            user: req.user._id,
            category
        });

        const createdQuestion = await question.save();
        
        // Populate user and category details
        await createdQuestion.populate('user', 'username');
        await createdQuestion.populate('category', 'name');
        
        res.status(201).json(createdQuestion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};



const updateQuestion = async (req, res) => {
  try {
      const {title , content , category} = req.body;

      // verify if the question category exist
      const categoryExists = await Category.findById(category);

      if (!categoryExists) {
          return res.status(400).json({ message : "The question category does not exist"})
      }

    const question = await Question.findById(req.params.id)

     if (!question){
        return res.status(404).json ({ message : 'The question does not exist'})
     }

    if(question.user.toString() !== req.user._id.toString()){
        return res.status(403).json ({ message : 'Sorry you dont have permission to edit this question'})
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.category = category || question.category;

    const updatedQuestion = await question.save();

    await updatedQuestion.populate('user','username');
    await updatedQuestion.populate('category','name');
   res.json(updatedQuestion)

  }
  catch(error){
    res.status(500).json({message : 'Server Error'})

  }
}



// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (only question author or admin)
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Check if the current user is the author of the question or an admin
        if (question.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this question' 
            });
        }

        // Delete all answers associated with this question
        await Answer.deleteMany({ question: question._id });

        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('user', 'username')
            .populate('category', 'name')
            .populate({
                path: 'answers',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            });

        if (question) {
            res.json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};





module.exports = {
    getQuestionsByCategory,
    createQuestion,
    getQuestionById,
    deleteQuestion,
    updateQuestion
};