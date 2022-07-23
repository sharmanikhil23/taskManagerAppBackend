const jwt = require("jsonwebtoken");
const user = require("../db/models/usersModel");

const authentication = async (req, res, next) => {
  try {
    let token = req.header("Authorization").replace("Bearer ", "");
    let verifyToken = jwt.verify(token, process.env.JWT_SECRETTOKEN);

    let findingUser = await user.findOne({
      " _id": verifyToken._id,
      "token.token": token,
    });

    if (!findingUser) {
      throw new Error("Please login");
    }
    req.user = findingUser;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send();
  }
};

module.exports = authentication;
