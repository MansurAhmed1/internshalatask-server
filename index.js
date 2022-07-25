
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// use middleware
app.use(cors());
app.use(express.json())






var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.v85be.mongodb.net:27017,cluster0-shard-00-01.v85be.mongodb.net:27017,cluster0-shard-00-02.v85be.mongodb.net:27017/?ssl=true&replicaSet=atlas-e24feo-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
})




////varifyjwt

function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;

  console.log(authHeader)
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
  
      return res.status(403).send({ message: "Forbidden access" });
    }
 
    req.decoded = decoded;
    next();
  });
}

    



async function run() {
  try {
    await client.connect();
    const productCollection = client.db('Internshalatask').collection('products');
    const userCollection = client.db('Internshalatask').collection('userCollection');
    const reviewCollection = client.db('Internshalatask').collection('reviewCollection');


//get product
    app.get('/products',async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query)
      const products = await cursor.toArray();
      res.send(products);
    });


//post products
app.post("/added", async (req, res) => {
    
    const added = req.body;
    const result = await productCollection.insertOne(added);
    res.send(result);
  });
  
  
  

/////////////////////single data with id///////////////
app.get("/product/:id", async (req, res) => {
  const id = req.params.id;

  const query = { _id: ObjectId(id) };
  const product = await productCollection.findOne(query);
  res.send(product);
});







//delete product
app.delete("/deleteproducts/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productCollection.deleteOne(query);
    res.send(result);
  });
  
  








//price update

app.put("/updateprice/:id", async (req, res) => {
    const id = req.params.id;
    const updateUser = req.body;
  
    const filter = { _id:ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
       price: updateUser.price
      }
    };
    const result = await productCollection.updateOne(
      filter,
      updatedDoc,
      options
    );
    res.send(result);
  });

// product update
app.put("/updatequantity/:id", async (req, res) => {
    const id = req.params.id;

    const updateUser = req.body;

    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
         qunatity: updateUser.quantity
      }
    };
    const result = await productCollection.updateOne(
      filter,
      updatedDoc,
      options
    );
    res.send(result);
  });



app.get("/myproducts",async (req, res) => {
    const email = req.query.email;

      const query = { email: email };
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
  
     
  });


app.get('/reviews', async (req, res) => {
    const query = {};
    const cursor = reviewCollection.find(query)
    const services = await cursor.toArray();
    res.send(services);
  });
  
  
//////////////////review post ////////////////////

app.post("/reviews", async (req, res) => {
    const newproduct = req.body;
   
    const result = await reviewCollection.insertOne(newproduct);
    res.send(result);
  });

  
  






////////////////////login korar somoy user je token create kore oita ba useToken er jonno eita muloto post ermoto kaj kore/////////////////
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
  
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365day' })
      res.send({ result, token });
    });
    

  }
  finally {

  }
}
 


 run().catch(console.dir);

 app.get("/", (req, res) => {
   res.send("running internshala task");
 });
 
 app.listen(port, () => {
   console.log("listening to port variable");
 });