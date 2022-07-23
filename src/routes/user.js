const user = require("../db/models/usersModel");
const express = require("express");
const router = new express.Router();
const authentication = require("../middleware/authentication");
const multer = require("multer");
const sharp = require("sharp");
const emailing = require("../emailing/account");
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, text, cb) {
    //need to learn regular expression to get good hold on this thing
    if (!text.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(new Error("Please provide the correct format of the file"));
    }
    cb(undefined, true);
  },
});

router.get("/users/me", authentication, async (req, res) => {
  res.send(req.user.result());
});

/**
 * This will be used to post and update the image
 */
router.post(
  "/user/me/avatar",
  authentication,
  upload.single("avatar"),
  async (req, res) => {
    const image = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = image;
    await req.user.save();
    res.send("Got your pic");
  },
  (error, req, res, next) => {
    if (error) {
      res.status(400).send({ error: error });
    }
  }
);
/**
 * This is used to delete the image of the user
 */
router.delete("/user/me/avatar", authentication, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

/**
 * This is used to get the avatar of the user
 */
router.get("/user/:id/avatar", async (req, res) => {
  try {
    const currentUser = await user.findById(req.params.id);

    if (!currentUser || !currentUser.avatar) {
      throw new Error();
    }
    res.set("Content-type", "image/png");
    res.send(currentUser.avatar);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users", async (req, res) => {
  const newUser = new user(req.body);
  try {
    let result = await newUser.save();
    const newUserToken = await newUser.authenticationToken();

    emailing.creatingNewUser(result.email, result.name);
    // console.log("called 3");
    return res.status(201).send({ user: result.result(), token: newUserToken });
  } catch (e) {
    res.status(404).send(e);
  }
});

router.patch("/users/me", authentication, async (req, res) => {
  const allowedUpdate = ["name", "email", "age", "password"];
  //this method is used to put all the name of the object we are getting to array
  let gettingUpdates = Object.keys(req.body);
  //every is one of the method in the array in which it will use the & with the result
  let result = gettingUpdates.every((item) => {
    if (allowedUpdate.includes(item)) {
      return true;
    }
  });

  if (!result || gettingUpdates.length == 0) {
    return res.status(404).send(" No a valid parameter to update");
  }

  try {
    let userFound = req.user;
    console.log(userFound);
    gettingUpdates.forEach((update) => {
      userFound[update] = req.body[update];
    });

    await userFound.save();

    if (!user) {
      return res.status(404).send();
    }

    return res.send(userFound);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete("/user/me", authentication, async (req, res) => {
  let _id = req.user._id;
  try {
    let user = await req.user.remove();
    emailing.removingUser(req.user.email, req.user.name);
    return res.send({ user: req.user.result(), message: "deleted" });
  } catch (e) {
    return res.status(404).send(e);
  }
});

router.post("/user/login", async (req, res) => {
  const requiredCredientials = ["email", "password"];
  const providedCredientails = Object.keys(req.body);

  if (providedCredientails.length != 2) {
    return res.status(400).send({ Error: "Please provide the credientials" });
  }
  try {
    const currentUser = await user.findByCredientials(req.body);
    const currentUserToken = await currentUser.authenticationToken();
    return res.send({ user: currentUser.result(), token: currentUserToken });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/user/logout", authentication, async (req, res) => {
  try {
    req.user.token = req.user.token.filter((tokens) => {
      return tokens.token != req.token;
    });
    await req.user.save();
    res.send({ result: "You are logged out" });
  } catch (e) {
    res.status(404).send({ Error: "Please login first" });
  }
});

router.post("/user/logoutAll", authentication, async (req, res) => {
  try {
    req.user.token = [];
    await req.user.save();
    res.send({ result: "You are logged out from all account" });
  } catch (e) {
    res.status(404).send({ Error: "Please login first" });
  }
});

router.delete("/user", authentication, async (req, res) => {
  try {
    await req.user.remove();
    emailing.removingUser(req.user.email, req.user.name);
    return res.send(req.user);
  } catch (e) {
    return res.status(500).send();
  }
});
module.exports = router;
