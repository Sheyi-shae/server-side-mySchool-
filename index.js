const express = require('express');
const app = express();
const db = require('./models');
const cors = require("cors");

require('dotenv').config();// environment


// Middleware
app.use(cors({
  origin: 'https://my-school-full-stack-client.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use('/topicuploads', express.static('topicuploads'));
app.use('/uploads', express.static('uploads'));

// Import the Users and Topics routes
const usersRoutes = require('./routes/Users');
const LikesRoutes = require('./routes/Likes');
const topicsRoutes = require('./routes/Topics');
const CommentsRoutes = require('./routes/Comments');
const ViewsRoutes= require('./routes/Views');

// Use the imported routes
app.use('/auth', usersRoutes);
app.use('/likes', LikesRoutes);
app.use('/topics', topicsRoutes);
app.use('/comments', CommentsRoutes);
app.use('/views', ViewsRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Invalid image uploaded' });
  });
  
  
// Database synchronization and server listening
db.sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log('Server is listening on port 3001');
  });
});
