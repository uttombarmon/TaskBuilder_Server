const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5200;
require('dotenv').config()
//middleware
app.use(express.json())
app.use(cors({
  origin: [
    'https://taskbuilder-609e1.web.app/'
]
}))

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8gn4coa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // user info save api 
    const userCollec = client.db('taskbuilder').collection('users')

    app.post('/v1/users', async (req, res) => {
      try {
        const userData = req.body.user
        console.log(userData);
        const data = await userCollec.insertOne(userData)
        console.log(data);
        res.send(data)
      } catch (error) {
        res.send(error)
      }
    })
    const taskColl = client.db('taskbuilder').collection('tasks')
    //get task
    app.get('/v1/gettask', async (req, res) => {
      const email = req.query.email
      console.log("h");
      const s = {
        "email": email
      }
      const tasks = await taskColl.find(s).toArray()
      if (tasks.length > 1) {
        const ortasks = tasks.sort((a, b) => a.deadline - b.deadline)
        const stasks = ortasks.sort((a, b) => {
          const order = { "low": 1, "medium": 2, "high": 3 }
          return order[b.priority.toLowerCase()] - order[a.priority.toLowerCase()]
        })
        const todoTasks = stasks.filter(task => task.status === "todo");
        const ongoingTasks = stasks.filter(task => task.status === "ongoing");
        const completedTasks = stasks.filter(task => task.status === "completed");
        const data = {
          "todo": todoTasks,
          "ongoing": ongoingTasks,
          "completed": completedTasks
        }
        return res.send(data)
      }
      res.send(tasks)
    })

    // change status api
    app.put('/v1/changeStatus',async(req,res)=>{
      const id = req.body.id
      const status = req.body.status
      const query = {
        $set:{
          "status":status
        }
      }
      const data = await taskColl.updateOne({_id: new ObjectId(id)},query)
      console.log(data);
      res.send(data)
    })
    // task add api 
    app.post('/v1/addtask',async(req,res)=>{
      const taskdata = req.body.task
      console.log(taskdata);
      const data = await taskColl.insertOne(taskdata)
      res.send(data)
    })
    //task delete api
    app.delete('/v1/deleteTask',async(req,res)=>{
      const id = req.query.id
      console.log(id)
      const data = await taskColl.deleteOne({_id:new ObjectId(id)})
      console.log(data);
      res.send(data)
    })
    app.get('/v1/task',async(req,res)=>{
      const id = req.query.id
      const data = await taskColl.findOne({_id: new ObjectId(id)})
      console.log(data);
      res.send(data)
    })
    // edit task api
    app.put('/v1/edittask',async(req,res)=>{
      const etask = req.body.etask
      console.log(etask);
      const id = req.body.id
      const updatedata = {
        $set:{
          "title": etask.title,
          "description": etask.description,
          "priority": etask.priority
        }
      }
      const data = await userCollec.updateOne({_id:new ObjectId(id)},updatedata)
      console.log(data);
      res.send(data)
    })
    app.get('/v1/ongoingtask',async(req,res)=>{
      const data = await taskColl.find({'status':'ongoing'}).toArray()
      console.log(data);
      res.send(data)
    })
    app.get('/v1/completedtask',async(req,res)=>{
      const data = await taskColl.find({'status':'completed'}).toArray()
      console.log(data);
      res.send(data)
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log('TaskBuilder is running port : 5200');
})
app.get('/', (req, res) => {
  res.send("TaskBuilder server is running...");
})