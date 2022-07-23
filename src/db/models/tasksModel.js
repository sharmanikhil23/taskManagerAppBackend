const { model, Schema, default: mongoose } = require("mongoose");

const taskSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
      required: false,
    },
    userId: {
      type: mongoose.ObjectId,
      required: true,
      ref: "Users",
    },
  },
  { timestamps: true }
);
const taskModel = model("Task", taskSchema);

module.exports = taskModel;
