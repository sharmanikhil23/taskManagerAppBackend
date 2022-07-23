const task = require("../db/models/tasksModel");
const express = require("express");
const authentication = require("../middleware/authentication");

const router = new express.Router();
/**
 * So here we  are just trying to improve the user experience by using the
 * first with the completed: so if user want to see only completed one or non completed we will modify it with that
 *
 * then we are making use of the limit to show some particular products per pages
 *
 * now we will try to sort the data by the date it is created
 *
 * -1 mean ascending and 1 mean descending
 *
 */
router.get("/tasks", authentication, async (req, res) => {
  const match = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  const sort = {};
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");

    sort.created = parts[1] === "desc" ? 1 : 0;
  }
  console.log(sort);

  try {
    //new advanced way to find all the tasks made by this user
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
      },
      sort,
    });
    res.send(req.user.tasks);
  } catch (e) {
    console.log(e);
    res.status(500).send("Error");
  }
});

router.get("/tasks/:id", authentication, async (req, res) => {
  let taskId = req.params.id;

  try {
    const tasks = await task.findOne({ _id: taskId, userId: req.user._id });
    if (!tasks) {
      return res.status(404).send({ error: "There is no task with same id" });
    }
    return res.send(tasks);
  } catch (e) {
    return res.status(404).send({ Error: "Not Found" });
  }
});

router.post("/tasks", authentication, async (req, res) => {
  const newTask = new task({ ...req.body, userId: req.user._id });
  try {
    let task = await newTask.save();
    return res.status(201).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.patch("/tasks/:id", authentication, async (req, res) => {
  let incomingUpdates = Object.keys(req.body);
  let allowedUpdates = ["description", "completed"];

  let allow = incomingUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!allow || incomingUpdates.length == 0) {
    return res
      .status(400)
      .send("Please provide the correct parameter to update");
  }

  try {
    let result = await task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    incomingUpdates.forEach((update) => {
      console.log(update);
      result[update] = req.body[update];
    });
    await result.save();

    if (!result) {
      return res.status(404).send();
    }

    return res.status(200).send(result);
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.delete("/task/:id", authentication, async (req, res) => {
  let _id = req.params.id;
  try {
    let result = await task.findOneAndDelete({ _id, userId: req.user._id });

    if (!result) {
      return res.status(404).send();
    }
    return res.send(result);
  } catch (e) {
    return res.status(404).send(e);
  }
});

router.delete("/task", authentication, async (req, res) => {});
module.exports = router;
