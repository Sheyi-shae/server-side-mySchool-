const express = require('express');
const router = express.Router();
const {validateToken}= require("../middlewares/Authmiddleware");
const { Op, where ,Sequelize,iLike} = require('sequelize');
const { Topics,Comments,Likes} = require('../models');
const multer = require('multer');




//multer image handler
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'topicuploads/'); // Upload destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique file name
  },
});

const upload = multer({ storage: storage });






//create post
router.post("/",validateToken,upload.single('image'), async (req, res) => {
    const topic = req.body;
    topic.firstName=req.user.firstName;
    topic.lastName=req.user.lastName;//to get username from the validatetoken
    topic.email=req.user.email;
    topic.username=req.user.username;
    topic.UserId=req.user.id//to get the UserId from the validatetoken to create a user in the post table
     // Check if an image was uploaded
     if (req.file) {
      topic.image = req.file.filename;
  } else {
      topic.image = null; // or some default value
  }
    await Topics.create(topic);//db confi
    res.json(topic);
  });

  //edit content
  router.put("/editPost",validateToken, async (req, res) => {
    const {newContent,newTitle,id} = req.body;
  const editPost= await Topics.update({content:newContent,topic:newTitle},{where:{id:id}}) //where id = id we are passing
    res.json(editPost);
  });
  //delete topic
  router.delete('/:topicId', validateToken, async (req, res) => {
    const topicId = req.params.topicId;
    try {
      // Delete associated likes first
      await Likes.destroy({
        where: {
          TopicId: topicId,
        },
      });
      //TopicId is a column in Likes table
  
      // Then delete the topic
      await Topics.destroy({
        where: {
          id: topicId,
        },
      });
  
      res.json({ message: 'Topic and associated likes deleted successfully' });
    } catch (err) {
      console.error('Error deleting topic:', err);
      res.status(500).json({ error: 'Deletion failed' });
    }
  });
  // Backend API route
  router.post('/views/:postId',validateToken, async (req, res) => {
    const postId = req.params.postId; // Changed from topicId to postId
  const UserId=req.user.id;
    
      const post = await Topics.findByPk(postId); 
      const userposts = await Topics.findOne({where:{UserId:UserId}}); 
      if (userposts) {
        return res.json( '' );
      }
      else{
  
      // Increment views by 1
      await Topics.update({ views: post.views + 1 }, { where: { id: postId } }); // 
  }
      return res.json({ success: true });
    } );
  

  
   

  //getting all posts from technology category and number of comments for post
  router.get("/posts/fd", validateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Page number, default to 1
    const limit = parseInt(req.query.limit) || 5; // Items per page, default to 10
    const offset = (page - 1) * limit;
  
    try {
      const listOfPosts = await Topics.findAndCountAll({
        limit,
        offset,
        where: { category: ['frontend'] },
        order: [["createdAt", "DESC"]],
        include: [{ model: Comments },{ model: Likes }]
      });
      
      const totalPages = Math.ceil(listOfPosts.count / limit);
      const currentPage = page > totalPages ? totalPages : page;
      const likedPosts = await Likes.findAll({where:{UserId:req.user.id}});
      res.json({
        listOfPosts: listOfPosts.rows,
        totalPages:totalPages,
        currentPage:currentPage,
        likedPosts:likedPosts
      })
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching posts.' });
    }
  });
  //getting all posts from sports category and number of comments for post
  router.get("/posts/bd", validateToken, async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Page number, default to 1
    const limit = parseInt(req.query.limit) || 5; // Items per page, default to 10
    const offset = (page - 1) * limit;
  
    try {
      const listOfPosts = await Topics.findAndCountAll({
        limit,
        offset,
        where: { category: ['backend'] },
        order: [["createdAt", "DESC"]],
        include: [{ model: Comments },{ model: Likes }]
      });
      
      const totalPages = Math.ceil(listOfPosts.count / limit);
      const currentPage = page > totalPages ? totalPages : page;
      const likedPosts = await Likes.findAll({where:{UserId:req.user.id}});
      res.json({
        listOfPosts: listOfPosts.rows,
        totalPages:totalPages,
        currentPage:currentPage,
        likedPosts:likedPosts
      })
    
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching posts.' });
    }
  });
  
  //getting posts by id
  router.get("/posts/fd/:id",validateToken, async (req, res) => {
    const id= req.params.id; 
    const likedPosts = await Likes.findAll({where:{UserId:req.user.id}});
    const post = await Topics.findByPk(id, {include: [{ model: Comments },{ model: Likes }]})
     // Construct the image URL using the image filename
     if (post?.image) {
      const imageUrl = `/topicuploads/${post.image}`; //topicuploads is the url declared in the main index.js
      post.imageURL = imageUrl;
      
    }
    res.json({post:post,likedPosts:likedPosts});
 
  
  });
  

//getting all posts from frontend category
router.get("/posts/bd",validateToken, async (req, res) => {
  const listOfPosts = await Topics.findAll({ where:{category:['backend']},order: [["createdAt", "DESC"]],});//db 
  
  res.json(listOfPosts);
  
});


//fetching posts for each user
router.get('/profile/posts',validateToken, async (req, res) => {
  const id= req.params.id; 
  const profileposts= await Topics.findAll({where:{UserId:req.user.id}},{attributes: { exclude: ["image"] }}, { order: [["createdAt", "DESC"]]});
 
res.json(profileposts);
})


//search route
router.get('/search', async (req, res) => {
  const { query } = req.query;

  try {
    const results = await Topics.findAll({
      where: {
        topic: {
          [Sequelize.Op.like]: `%${query}%`
        }
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



  module.exports = router;