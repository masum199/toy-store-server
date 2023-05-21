const express = require('express')
const cors = require('cors')
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

app.use(cors(corsOptions))
app.use(express.json());


// mongo

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.uya6aoa.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const toysStoreData = client.db('toystore').collection('toys');
    


    // const indexKeys = { toyName: 1}
    // const indexOptions = { name: "toy"}

    // const result = await toysStoreData.createIndex(indexKeys,indexOptions)
    
    app.get('/alltoys/:text', async (req, res) => {
      const searchText = req.params.text;
      const result = await toysStoreData
        .find({
          $or: [
            { toyName: { $regex: searchText, $options: "i" } }
          ]
        })
        .toArray();
      res.send(result);
    });

    // data of user and short
    app.get('/alltoys/user/:email', async (req, res) => {
      const email = req.params.email;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
      try {
        const result = await toysStoreData
          .find({ sellerEmail: email })
          .collation({ locale: 'en_US', numericOrdering: true }) 
          .sort({ price: sortOrder })
          .toArray();
    
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });



    // to insert toys
    app.post('/alltoys', async (req, res) => {
        const toys = req.body;
        console.log(toys)
        const result = await toysStoreData.insertOne(toys);
        res.send(result)
      })

      // to get  all the Toys
      app.get('/alltoys', async (req, res) => {
        const result = await toysStoreData.find().toArray()
        res.send(result)
      })

      // to see vew the  toys vew details
      app.get('/alltoys/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await toysStoreData.findOne(query)
        res.send(result)
      })

      // to update
      app.put('/alltoys/put/:id', async (req, res) => {
        const id = req.params.id;
        const user = req.body
        console.log(id,user)
        const filter = {_id: new ObjectId (id)}
        const options = {upsert: true}
        const updatedUser = {
          $set: {
            price: user.price,
            quantity: user.quantity,
            details: user.details
          }
        }
  
        const result = await toysStoreData.updateOne(filter,updatedUser,options)
        res.send(result);
      })


      // to delete toys
      app.delete('/alltoys/delete/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toysStoreData.deleteOne(query);
        res.send(result)
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongo finish





app.get('/', (req, res) => {
    res.send('toy store is running');
  })
  
  app.listen(port, () => {
    console.log(`toy store is running on port${port}`)
  })