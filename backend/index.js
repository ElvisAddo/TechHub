const express = require("express");
const PORT = process.env.PORT || 3001;
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();

const connection = require('./config/Database');

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname + '/public/build')));
app.use((express.json()));

console.log('Environment variables:', {
  MONGODB_URI: process.env.MONGODB_URI ? '*** URI is set ***' : 'MONGODB_URI is NOT set',
  PORT: process.env.PORT || 'Using default port'
});

//routes - must be defined BEFORE the catch-all route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));

app.use((err, req, res, next) => {
  console.log(err)
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      status: false,
      message: 'Invalid JSON Data Passed'
    })
  }
  console.log('my errr', err)
  next(err)
})

// Catch-all route for serving React app - must be LAST
app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
})


 app.listen(PORT, () => {
    console.log(`Server is now running here on ${PORT}`);
  });

// const startServer = async () => {
//  try {
//     await connection();    
 
//  }
//   catch (error){
//      console.log('An error occured in starting server')
//   }
// }

// await startServer()