const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

//uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgg2e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

//client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Bicycle_Store");
        const cycleCollection = database.collection("Products");

        // add API
        app.post('/products', async (req, res) => {
            const product = req.body;
            // console.log(product);
            const products = await cycleCollection.insertOne(product);
            res.json(products);
        })

        // get API
        app.get('/products', async (req, res) => {
            const cursor = cycleCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        // get API with Limit
        app.get('/products/query', async (req, res) => {
            const limit = req.query.limit;
            // console.log(limit);
            const int = parseInt(limit);
            // console.log(int)
            const cursor = cycleCollection.find({});
            const products = await cursor.limit(int).toArray();
            res.json(products);

        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Bicycle store')
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})