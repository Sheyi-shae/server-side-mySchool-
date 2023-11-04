const express = require("express");
const router = express.Router();
const { Views ,Topics} = require("../models"); // db posts
const { validateToken } = require('../middlewares/Authmiddleware');

router.post('/:postId', validateToken,async (req, res) => {
  
    const postId = req.params.postId; // Changed from topicId to postId
  
    
      const post = await Topics.findByPk(postId); 
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Increment views by 1
      await Views.update({ Views: post.Views + 1, }, { where: { TopicId: postId } }); // 
  
      return res.json({ success: true });
    } 
  );

module.exports = router;

