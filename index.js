const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vwx9p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// client.connect((err) => {
//     const collection = client.db('test').collection('devices');
//     console.log('DB connected!');
//     client.close();
// });

async function run() {
    try {
        await client.connect();
        console.log('DB connected.');
        const db = client.db('geniusCar');
        const toolsCollection = db.collection('tools');
        const reviewsCollection = db.collection('reviews');
        const ordersCollection = db.collection('orders');
        const usersCollection = db.collection('users');

        // tools
        app.post('/tools', async (req, res) => {
            await toolsCollection.insertOne(req.body);
            res.json({ message: 'ok' });
        });

        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/tools/:id', async (req, res) => {
            const query = {
                _id: ObjectId(req.params.id),
            };
            const item = await toolsCollection.findOne(query);
            res.send(item);
        });

        // reviews
        app.post('/reviews', async (req, res) => {
            await reviewsCollection.insertOne(req.body);
            res.json({ message: 'ok' });
        });

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // orders
        app.post('/orders', async (req, res) => {
            await ordersCollection.insertOne(req.body);
            res.json({ message: 'ok' });
        });

        app.get('/orders', async (req, res) => {
            const query = {};
            if (req.query.email) query.email = req.query.email;
            const cursor = ordersCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.delete('/orders/:id', async (req, res) => {
            const query = {
                _id: ObjectId(req.params.id),
            };
            await ordersCollection.deleteOne(query);
            res.json({ message: 'ok' });
        });

        // users
        app.post('/users', async (req, res) => {
            await usersCollection.insertOne(req.body);
            const user = await usersCollection.findOne({
                email: req.body.email,
            });
            if (!user) return res.send({ token: '', admin: false });
            const token = jwt.sign(user, process.env.SECRET);
            res.send({ token, admin: user.admin });
        });

        app.get('/users', async (req, res) => {
            const query = {};
            if (req.query.email) query.email = req.query.email;
            const user = await usersCollection.findOne(query);
            if (!user) return res.send({ token: '', admin: false });
            const token = jwt.sign(user, process.env.SECRET);
            res.send({ token, admin: user.admin });
        });
    } finally {
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running...');
});

app.listen(port, () => {
    console.log(`Listening on ${port}...`);
});
