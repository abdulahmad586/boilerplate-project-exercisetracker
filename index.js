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


app.get("/api/users/", async (req,res)=>{

  const result = await User.find().exec();
  
  res.json(result);
})

app.post("/api/users/", async (req,res)=>{

  const { username } = req.body;
  const user= new User({username});
  const result = await user.save();
  res.json(result);
})

app.post("/api/users/:_id/exercises", async (req,res)=>{
  const {_id} = req.params;
  const { description, duration, date=Date.now() } = req.body;
  
  const user= await User.findOne({_id});

  const dateObj = new Date(date);

  const exercise = new Exercise({username:user.username, description, duration, date:dateObj});

  const exResult = await exercise.save();

  const result= {username:user.username, description, duration:parseInt(duration), date:dateObj.toDateString(), _id: user.id};
  res.json(result);
})

app.get("/api/users/:_id/logs", async (req,res)=>{
  const {_id} = req.params;
  const {from, to, limit} = req.query;

  const user= await User.findOne({_id});

  const query = { username: user.username };

  if (from && to) {
    query.date = { $gte: new Date(from), $lte: new Date(to) };
  } else if (from) {
    query.date = { $gte: new Date(from) };
  } else if (to) {
    query.date = { $lte: new Date(to) };
  }

  const exercises = await Exercise.find(query).limit(parseInt(limit)).exec()
  const result = {
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log:exercises.map(e=>{
      const {description, duration, date} = e;
      return { description, duration, date:date.toDateString() }
    })
  }

  res.json(result);
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
