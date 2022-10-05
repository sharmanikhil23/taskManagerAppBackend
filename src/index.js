const app = require("./app");
const express = require("express");

const RunningPORT = process.env.PORT;

app.listen(RunningPORT, () => {
  console.log("Connected with to the port " + RunningPORT);
});
