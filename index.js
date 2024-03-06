const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Mongoose = require("mongoose");
require("dotenv").config();
Mongoose.connect(process.env.MONGO_URI)
  .then((data) => {
    console.log("connected");
  })
  .catch((e) => {
    console.log("error");
  });
const ExcerciseModel = Mongoose.model(
  "Excercise",
  new Mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
  })
);
const UserModel = Mongoose.model(
  "User",
  new Mongoose.Schema({
    username: String,
    count: Number,
    log: [{ description: String, duration: Number, date: Date }],
  })
);
const LogModel = Mongoose.model(
  "Log",
  new Mongoose.Schema({
    url: String,
    short_url: { type: Number, require: true },
  })
);
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.get("/api/users", function (req, res) {
  UserModel.find({})
    .then((data) => res.json(data))
    .catch((e) => res.send("error"));
});

app.post("/api/users", function (req, res) {
  console.log(req.body);
  const user = new UserModel({ username: req.body.username });
  user
    .save()
    .then((data) => res.json({ username: data.username, _id: data._id }))
    .catch((e) => res.send("error"));
});

app.post("/api/users/:_id/exercises", function (req, res) {
  const username = UserModel.findById(req.params._id)
    .then((data) => {
      const excercise = new ExcerciseModel({
        username: data.username,
        description: req.body.description,
        duration: req.body.duration,
        date: req?.body?.date
          ? new Date(req?.body?.date).toDateString()
          : new Date().toDateString(),
      });
      excercise
        .save()
        .then((data) =>
          res.json({
            username: data.username,
            description: data.description,
            duration: data.duration,
            date: data.date,
            _id: data._id,
          })
        )
        .catch((e) => {
          console.log(e);
          res.send("error");
        });
    })
    .catch((e) => console.log(e));
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
