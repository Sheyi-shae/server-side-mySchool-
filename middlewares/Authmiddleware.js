const errorMessages = {
    userNotLoggedIn: 'User not logged in!',
    
    invalidAcessDetected: 'Invalid access dectected',
    
  };

const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) {
    return res.status(401).json({ error: errorMessages.userNotLoggedIn });
  }

  try {
    const validToken = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
    req.user = validToken;//major use in API sessioon
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: "Session expired" });
  }
};

module.exports = { validateToken };
