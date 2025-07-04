require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkncn1b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const database = client.db("pro_fast_db");

        const parcelsCollection = database.collection('parcels');

        app.get('/parcels', async (req, res) => {
            const result = await sendParcelCollections.find({}).toArray();
            res.send(result);
        });

        app.post('/parcels', async (req, res) => {
            try {
                const newParcel = req.body;
                console.log(newParcel);
                const result = await parcelsCollection.insertOne(newParcel);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Failed to create parcel' })
            }
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Welcome to the Parcel Service API!');
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});