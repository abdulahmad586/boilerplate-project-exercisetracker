const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }
});

let User = mongoose.model("User", userSchema);

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required:true,
  }
});

let Exercise = mongoose.model("Exercise", exerciseSchema);

const logSubSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const logSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  log: {
    type: [logSubSchema],
    required: true
  }
});

let Log = mongoose.model("Log", logSchema);


const app = express()
const cors = require('cors')


app.use(bodyParser.urlencoded({extended:true}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users/", async (req,res)=>{

  const { username } = req.body;
  const user= new User({username});
  const result = await user.save();
  res.json(result);
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
