const express = require('express');
const router = express.Router();
const {validateToken}= require("../middlewares/Authmiddleware");
const { Op, where } = require('sequelize');
const { Comments,Users } = require('../models');


//creating comment
router.post("/", validateToken, async (req, res) => {
    const { CommentBody, TopicId,Post } = req.body;
    const { firstName,lastName,email} = req.user; 
  const UserId= req.user.id;
 
    try {
      const comment = await Comments.create({
        CommentBody,
        TopicId,
        Post,
        firstName,
        lastName,
        email,
      
        
        UserId, // Save the retrieved username in the comment
      });
  
      res.json(comment);
    } catch (err) {
      res.status(500).json({ error: "Failed to save comment." });
    }
  });
  //fetching comments with user image
  router.get("/:topicsId",validateToken, async (req, res) => {
    const topicsId = req.params.topicsId;// topicsId is the route
    const comments = await Comments.findAll({where:{TopicId:topicsId},  order: [["createdAt", "DESC"]], include: [
      {
        model: Users,
        as: 'User', // Use the alias here
        attributes: ["image"]
      }
    ]});
   

    
    res.json({comments}); 
  });
  //delete comment
  router.delete('/:commentId',validateToken,async (req, res)=>{
    const commentId = req.params.commentId;
  try{
    await Comments.destroy({
      where :{
        id: commentId,
      },
    })
   
    res.json('delete');
  }catch(err){
    res.status(500).json({ error: "deletion failed" });
  }
  })

//fetching comment activities for each user
router.get('/',validateToken, async (req, res) => {

  const profilecommments= await Comments.findAll({where:{UserId:req.user.id}, order: [["createdAt", "DESC"]],} );
 
res.json(profilecommments);

})
// edit comment
router.put("/:commentId",validateToken, async (req, res) => {
  const commentId = req.params.commentId;
  const {editedCommentBody} = req.body;
  console.log(editedCommentBody);
const editComment= await Comments.update({CommentBody:editedCommentBody},{where:{id:commentId}}) //where id = id we are passing
  res.json(editComment);
  
});









module.exports =router;