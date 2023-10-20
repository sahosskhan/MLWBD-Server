const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log(process.env.DB_USERNAME);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.x63gjwg.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const contentCollection = client.db("contentDB").collection("content");
    const CartCollection = client.db("contentDB").collection("MyCartContent");

    app.get("/content/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const newdata = await contentCollection.find(query);
      const result = await newdata.toArray();
      res.send(result);
    });

    app.post("/addCarts", async (req, res) => {
      const Cart = req.body;
      const result = await CartCollection.insertOne(Cart);
      res.send(result);
    });

    app.get("/addCarts", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await CartCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/addCarts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await CartCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/content", async (req, res) => {
      const content = contentCollection.find();
      const result = await content.toArray();

      res.send(result);
    });

    app.get("/contents/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contentCollection.findOne(query);
      res.send(result);
    });

    app.put("/contents/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateContent = req.body;
      const content = {
        $set: {
          name: updateContent.name,
          description: updateContent.description,
          brand: updateContent.brand,
          type: updateContent.type,
          price: updateContent.price,
          rating: updateContent.rating,
          photo: updateContent.photo,
        },
      };
      const result = await contentCollection.updateOne(
        filter,
        content,
        options
      );
      res.send(result);
    });

    app.post("/content", async (req, res) => {
      const addContent = req.body;
      console.log(addContent);
      const result = await contentCollection.insertOne(addContent);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome To My Server");
});

app.listen(port, () => {
  console.log(`listening on port , ${port}`);
});
