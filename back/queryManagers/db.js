// db.js
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'quanridor';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

let db = null;

async function connectDB() {
    await client.connect();
    console.log('Connected successfully to MongoDB server');
    db = client.db(dbName);
}

function getDB() {
    if (!db) {
        throw 'Database connection is not established!';
    }
    return db;
}

module.exports = { connectDB, getDB };
