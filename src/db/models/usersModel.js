const { model, Schema } = require("mongoose");

const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const task = require("./tasksModel");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not an appropriate email");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validator(value) {
        if (value <= 0) {
          throw new Error("Age cannot be 0 or less than zero ");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 6,
      validate(value) {
        if (value.toLowerCase().includes("password"))
          throw new Error("You cannot use password as password");
      },
    },
    avatar: {
      type: Buffer,
    },
    token: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.statics.findByCredientials = async ({ email, password }) => {
  let user = await userModel.findOne({ email: email });

  if (!user) {
    throw new Error(" There is no user with " + email);
  }

  let result = bcrypt.compareSync(password, user.password);

  if (result) {
    return user;
  } else {
    throw new Error("Invalid user name or password");
  }
};

/**
 * This one is for hashing the password which user have given to us for security purposes
 */
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    const hashPassword = await bcrypt.hashSync(user.password, 8);
    user.password = hashPassword;
  }
  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;
  let removedTask = await task.deleteMany({ userId: user._id });
  next();
});

userSchema.methods.authenticationToken = async function () {
  const user = this;
  const userToken = jwt.sign(
    { _id: this._id.toString() },
    process.env.JWT_SECRETTOKEN
  );

  user.token = user.token.concat({ token: userToken });
  await user.save();

  return userToken;
};

/**
 * This method will help us to remove the unnecessary details for the users and sending
 * everything back either user is making account or login
 * @returns
 */
userSchema.methods.result = function () {
  let user = this;
  let userObject = user.toObject();

  delete userObject.password;
  delete userObject.token;
  delete userObject.avatar;

  return userObject;
};

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id", //of user collection
  foreignField: "userId", //of tasks collection
});

const userModel = model("Users", userSchema);
module.exports = userModel;
