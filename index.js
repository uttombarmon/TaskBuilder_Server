const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5200;
require('dotenv').config()
//middleware
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion } = require('mongodb');
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
    
    app.post('/v1/users',async(req,res)=>{
        try {
            const userData = req.body.user
            console.log(userData);
            const data =await userCollec.insertOne(userData)
            console.log(data);
            res.send(data)
        } catch (error) {
            res.send(error)
        }
    })
    const taskColl = client.db('taskbuilder').collection('tasks')
    //get task
    app.get('/v1/gettask',async(req,res)=>{
      const email = req.query.email
      console.log("h");
      const s = {
        "email":email
      }
      const tasks = await taskColl.find(s).toArray()
      if (tasks.length>1) {
        const h= []
        const m= []
        const l = []
        const ortasks = tasks.sort((a,b)=> a.deadline - b.deadline)
        // console.log(stasks);
        const stasks= ortasks.sort((a,b)=>{
          const order = {"low":1,"medium":2,"high":3}
          return order[b.priority.toLowerCase()] - order[a.priority.toLowerCase()]
        }) 
        // const data = [...h,...m,...l]
        // console.log(data);
        return res.send(stasks)    
      }
      res.send(tasks)
    })





  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port,()=>{
    console.log('TaskBuilder is running port : 5200');
})
app.get('/', (req, res) => {
    res.send("TaskBuilder server is running...");
})