const express = require("express");
const app = express();
const RunningPORT = process.env.PORT;

//Connecting mongo db
require("../src/db/connectMongoDb");
const task = require("./db/models/tasksModel");
const user = require("./db/models/usersModel");
const authentication = require("./middleware/authentication");

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/**
 * Loading in the task router which have all the crud operartions
 */
const userRouter = require("./routes/user");
app.use(userRouter);

/**
 *locading in the task router which have all the crud operations and notifying the app too
 */

const taskRouter = require("./routes/task");
app.use(taskRouter);

app.listen(RunningPORT, () => {
  console.log("Connected with to the port " + RunningPORT);
});
