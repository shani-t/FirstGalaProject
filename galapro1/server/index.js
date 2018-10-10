//Requires
const express = require("express");
const cors = require("cors");
const Redirect = require("./models/redirect");
var { mongoose } = require("./db/mongoose");
const bodyParser = require("body-parser");

//mongoDB
const { MongoClient, ObjectID } = require("mongodb");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Allow cors in order to allow client side to access / send http request to the server
var whitelist = ["http://localhost:8100"];
var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

app.use(cors(corsOptions));

const server = app.listen(process.env.PORT || port, (req, res) => {
  console.log(`server started on port ${port}`);
});
MongoClient.connect(
  "mongodb://localhost:27017/galaApp",
  (err, db) => {
    if (err) {
      return console.log("Unable to connect to MongoDB server");
    }
    console.log("Connected to MongoDB server");
    db.close();
  }
);
//Application vars

//validation
app.post("/api/update", (req, res, next) => {
  const redirect = new Redirect({
    data: req.body.data
  });

  if (!req.body.isChecked && req.body.data) {
    res.status(500).send("the checkbox isn't marked");
  } else if (req.body.regexValidation && req.body.isChecked) {
    console.log("valid");
    if (!req.body.data.includes("http")) {
      req.body.data = "http://" + req.body.data;
    }
    res.status(200).json({
      data: req.body.data
    });
  } else if ((!req.body.regexValidation || !req.body.data) && req.body.isChecked) {
    console.log("not valid");

    res.status(200).json({
      data: "http://www.google.com"
    });
    // db.collection("redirects").find({}, function(err, item) {
    //   if (item) {
    //     res.status(200).json({
    //       data: item.data
    //     });
    //   } else {
    //     res.status(500).send("The url is invalid and there is not default url");
    //   }
    // });
  }

  console.log(redirect);
});

//add Default
app.post("/api/addDefault", (req, res, next) => {
  console.log(req.body.data);
  const redirect = new Redirect({
    data: req.body.data
  });

  console.log(redirect);
  redirect.save();
  res.status(201).json({
    message: "Default added successfully"
  });
});

module.exports = app;
