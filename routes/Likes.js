const express = require("express");
const router = express.Router();
const { Likes } = require("../models"); // db posts
const { validateToken } = require('../middlewares/Authmiddleware');

router.post('/', validateToken, async (req, res) => {
  const { TopicId,Post } = req.body;
  const UserId  = req.user.id;

  try {
    const found = await Likes.findOne({ where: { TopicId, UserId } });

    if (!found) {
      await Likes.create({ TopicId, UserId,Post });
      res.json({liked:true}); 
    } else {
      await Likes.destroy({ where: { TopicId, UserId } });
      res.json({liked:false});
    }
    //we use true/false in the json response because a user is only permitted like once
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
 
});
//fetching like activities for each user
router.get('/profile',validateToken, async (req, res) => {
  const id= req.params.id; 
  const profilelikes= await Likes.findAll({where:{UserId:req.user.id}, order: [["createdAt", "DESC"]],} );
 
res.json(profilelikes);
})

module.exports = router;

