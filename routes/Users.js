// Backend: auth.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Users,Comments } = require('../models');
const { Op } = require('sequelize');
const{sign}=require('jsonwebtoken');
const multer = require('multer');
const {validateToken}=require('../middlewares/Authmiddleware')

require('dotenv').config();

const errorMessages = {
  userNotFound: 'User not found',
  emailNotFound: 'Email does not exist',
  invalidCredentials: 'Username/Email or password does not match',
 
  userRegistrationSuccessful: 'User registration successful',
  usernameAlreadyTaken: 'Username already taken',
  emailAlreadyTaken: 'Email exists',
  invalidImageFile:'Invalid image file uploaded'
};



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Upload destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname); // Unique file name
  },
});
//image validation
const imageFilter = (req, file, cb) => {
  if (!file || !file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error(errorMessages.invalidImageFile), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { firstName, lastName, date, state, city, gender, username, email, password } = req.body;

    // Check if username already exists
    const existingUser = await Users.findOne({ where: { username } });
    const existingEmail = await Users.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ error: errorMessages.usernameAlreadyTaken });
    } else if (existingEmail) {
      return res.status(409).json({ error: errorMessages.emailAlreadyTaken });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    // Check if an image was uploaded
    if (req.file) {
      newUser = await Users.create({
        firstName,
        lastName,
        state,
        date,
        city,
        gender,
        username,
        email,
        password: hashedPassword,
        image: req.file.filename,
      });
    } else {
      newUser = await Users.create({
        firstName,
        lastName,
        state,
        date,
        city,
        gender,
        username,
        email,
        password: hashedPassword,
      });
    }

    res.status(201).json({ message: errorMessages.userRegistrationSuccessful, user: newUser });
  } catch (error) {
    console.error('The error is here', error);
    res.status(500).json({ error: errorMessages.internalServerError });
  }
});


//accesstoken
const generateAccessToken = (usernameOrEmail, userId,firstName,lastName,email,image,balance) => {
  const accessToken = sign({ usernameOrEmail, id: userId,firstName,lastName,email,image,balance}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" });
  return accessToken;
};

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find user by username or email
    const user = await Users.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: errorMessages.invalidCredentials });
    }
 // Generate access token
 const accessToken = generateAccessToken(user.usernameOrEmail, user.id,user.firstName,user.lastName,user.email,user.image,user.balance);

 res.json({token: accessToken , username:usernameOrEmail ,email:user.email,firstName:user.firstName,lastName:user.lastName, id:user,balance:user.balance});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: errorMessages.internalServerError });
  }
});

router.get('/profile',validateToken, async (req, res) => {
  const id= req.params.id; 
  const profile= await Users.findAll({where:{id:req.user.id}},{attributes: { exclude: ["password"] }});
  if (profile?.image) {
    const imageUrl = `/uploads/${profile.image}`; //uploads is the url declared in the main index.js
    profile.imageURL = imageUrl;
    
  }
res.json(profile);
})

//update profile picture
router.put('/changedp',  validateToken,upload.single('image'), async (req, res) => {
  
  try {
    const newImageFilename = req.file.filename;

   

    // Delete the previous image if it exists
    const user = await Users.findByPk(req.user.id);
    if (user.image) {
      const previousImagePath = path.join(__dirname, '../uploads/', user.image);
      fs.unlink(previousImagePath, (err) => {
        if (err) {
          console.error('Error deleting previous image:', err);
        } else {
          console.log('Previous image deleted successfully');
        }
      });
    }
     // update image of the  user
    
     await Users.update({image:newImageFilename},{where:{id:req.user.id}})
    


    res.json({ newImageFilename });
  } catch (error) {
    console.error('Error changing profile picture:');
    res.status(500).json({ error: errorMessages.invalidImageFile });
  }
});

//update balance
router.post('/balance', validateToken,async (req, res) => {
  const {amount}=req.body;
  const id =req.user.id;
  const user= await Users.findByPk(id); 
  if (!user) {
    return res.status(404).json({success:false, message:'user not found'})
  }
  console.log(parseFloat(amount));
    //update balance for each user
    //balance is a column in the database
try {
  await Users.update({ balance: parseFloat(user.balance) + parseFloat(amount), }, { where: { id: req.user.id } }); // 

  return res.json({ success: true, message:'balance updated successfully' });
} catch (error) {
  console.error('Error updating your balance', error)
  return res.status(500).json({success:false, message:'You are not connect'})
}
   
  } 
);


module.exports = router;
