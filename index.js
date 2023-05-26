const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

//uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgg2e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);

//client
const client = new MongoClient(uri, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    const database = client.db("Bicycle_Store");
    const cycleCollection = database.collection("Products");
    const reviewCollection = database.collection("Reviews");
    const purchaseCollection = database.collection("Purchase");
    const usersCollection = database.collection("Users");

    // add products
    app.post("/products", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const products = await cycleCollection.insertOne(product);
      res.json(products);
    });

    // get products
    app.get("/products", async (req, res) => {
      if (req.query.rating) {
        const filter = req.query.rating;

        const cursor = await cycleCollection
          .find({
            rating: { $gt: filter, $lte: 5 },
          })
          .toArray();
        // console.log(cursor);
        res.json(cursor);
      } else {
        const cursor = cycleCollection.find({});
        const products = await cursor.toArray();
        res.send(products);
      }
    });

    // get API with Limit
    app.get("/products/limit", async (req, res) => {
      const limit = req.query.number;
      // console.log(limit);
      const int = parseInt(limit);
      // console.log(int)
      const cursor = cycleCollection.find({});
      const products = await cursor.limit(int).toArray();
      res.json(products);
    });

    // get product by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cycleCollection.findOne(query);
      res.json(result);
    });

    // delete product by id
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cycleCollection.deleteOne(query);
      res.json(result);
    });

    // add a review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      // console.log('hit the post')
      // console.log(result);
      res.json(result);
    });

    // get a review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // get API with Limit
    app.get("/reviews/limit", async (req, res) => {
      const limit = req.query.number;
      // console.log(limit);
      const int = parseInt(limit);
      // console.log(int)
      const cursor = reviewCollection.find({});
      const reviews = await cursor.limit(int).toArray();
      res.json(reviews);
    });

    // add a purchase
    app.post("/purchase", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const purchase = await purchaseCollection.insertOne(product);
      res.json(purchase);
    });

    // get a purchase
    app.get("/purchase", async (req, res) => {
      const cursor = purchaseCollection.find({});
      const purchase = await cursor.toArray();
      res.json(purchase);
    });

    // get a purchase by email
    app.get("/purchase/email", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = purchaseCollection.find(query);
      // console.log(product);
      const purchase = await cursor.toArray();
      res.json(purchase);
    });

    // get purchase by id
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.findOne(query);
      res.json(result);
    });

    // delete purchase by id
    app.delete("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.json(result);
    });

    //add new users
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log("hit the post");
      console.log(result);
      res.json(result);
    });

    // get users
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      console.log(result);
      res.json(result);
    });

    // update new users
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    // add a admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.json(result);
    });

    // check if user is admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Bicycle store server");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});

// Export the Express API
module.exports = app;
