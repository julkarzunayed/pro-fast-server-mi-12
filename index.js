require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIP_SECRET);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // GET API: Retrieve parcels, with optional user email query and latest first
        app.get('/parcels', async (req, res) => {
            try {
                if (!parcelsCollection) {
                    return res.status(503).json({ message: "Database not connected or 'parcelCollections' not initialized yet." });
                }

                const userEmail = req.query?.userEmail;
                const parcelId = req.query?.parcelId;
                let query = {}; // Initialize an empty query object

                // If userEmail is provided, add it to the query filter
                if (userEmail) {
                    query.created_by = userEmail;
                }
                if (parcelId) {
                    query._id = new ObjectId(parcelId);
                }

                // Find documents based on the constructed query
                // Sort by 'createdAt' field in descending order (-1 for latest first)
                const parcels = await parcelsCollection.find(query).sort({ createdAt: -1 }).toArray();

                res.status(200).json(parcels);

            } catch (error) {
                console.error("Error retrieving parcels:", error);
                res.status(500).json({ message: "Failed to retrieve parcels.", error: error.message });
            }
        });

        app.post('/parcels', async (req, res) => {
            try {
                const newParcel = req.body;
                // console.log(newParcel);
                const result = await parcelsCollection.insertOne(newParcel);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Failed to create parcel' })
            }
        });

        app.delete('/parcels/:id', async (req, res) => {
            try {

                const id = req.params.id;

                // Convert the string ID to a MongoDB ObjectId
                const query = { _id: new ObjectId(id) };

                // Delete the document from the 'parcelsCollection' collection
                const result = await parcelsCollection.deleteOne(query);
                res.send(result);

            } catch (error) {
                console.error("Error deleting parcel:", error);
                res.status(500).json({ message: "Failed to delete parcel.", error: error.message });
            }
        });

        app.post("/create-checkout-session", async (req, res) => {
            const amountInCents = req.body?.amountInCents;
            console.log(amountInCents)
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: amountInCents, // Amount in cents
                    currency: 'usd',
                    payment_method_types: ['card'],
                });

                res.json({ clientSecret: paymentIntent.client_secret });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }

        });


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