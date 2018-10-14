//Requires
const express = require("express");
const cors = require("cors");
const Redirect = require("./models/redirect");
var {
  mongoose
} = require("./db/mongoose");
const bodyParser = require("body-parser");
const DEFAUTL_URL = "http://www.google.com";
//mongoDB
const {
  MongoClient,
  ObjectID
} = require("mongodb");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//Allow cors in order to allow client side to access / send http request to the server
var whitelist = ["http://localhost:8100"];
var corsOptions = {
  origin: function (origin, callback) {
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

//socket variables
var io = require("socket.io").listen(server);

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
app.post("/api/update", async (req, res, next) => {
  try {
    const redirect = new Redirect({
      data: req.body.data
    });

    var regexPattern = RegExp(
      "https?://(?:www.|(?!www))[^s.]+.[^s]{2,}|www.[^s]+.[^s]{2,}"
    );
    var regexValidation = regexPattern.test(req.body.data.toString());

    if (!req.body.isChecked && req.body.data) {
      console.log("checkbox not marked");
      if (regexValidation) {
        res.status(500).send("the checkbox isn't marked");
      } else {
        res.status(500).send("the checkbox isn't marked and url is invalid");
      }
    } else if (regexValidation && req.body.isChecked) {
      console.log("valid url");
      if (!req.body.data.includes("http")) {
        req.body.data = "http://" + req.body.data;
      }
      res.status(200).json({
        data: req.body.data
      });
    } else if ((!regexValidation || !req.body.data) && req.body.isChecked) {
      console.log("not valid url");
      const getRedirect = await Redirect.findOne({});
      if(getRedirect){
        console.log(getRedirect);
        /* Task 1 */
        // res.status(200).json({
        //   data: DEFAUTL_URL
        // });
        /* Task 2 */
        res.status(200).json({
            data: getRedirect.data
          });
      }else{
        res.status(500).send("url is invalid and there is no default url");
      }
    
    }
  } catch (err) {
    console.log(err);
    //TODO : return error
  }
});

//add Default
app.post("/api/addDefault", (req, res, next) => {
  const redirect = new Redirect({
    data: req.body.data
  });

  redirect.save();
  res.status(201).json({
    message: "Default added successfully"
  });
});



async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}


io.on("connection", socket => {
  console.log('connected');
  socket.on("set-current-url", async (url) => {
    try {
      socket.url = url;

      const redirect = await Redirect.findOne({});

      while (url != 'stop') {
      io.emit("url-changed", {
        redirectRes: url,
        event: "new"
      });
      await delay(5000);
      io.emit("url-changed", {
        redirectRes: redirect.data,
        event: "default"
      });
      await delay(5000);
      }

    } catch (err) {
      //handling error.
      console.log(err);
    }


  });
  socket.on('disconnect', function(){
    io.emit('url-changed', {redirectRes: 'stop', event: 'left'});   
  });
});



module.exports = app;
