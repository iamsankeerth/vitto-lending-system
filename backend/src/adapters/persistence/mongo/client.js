import { MongoClient } from 'mongodb';
import { config } from '../../../infrastructure/config/env.js';

let client = null;
let db = null;

export async function connectMongo() {
  if (client) return db;
  client = new MongoClient(config.mongodbUrl);
  await client.connect();
  db = client.db();
  return db;
}

export function getDb() {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.');
  return db;
}

export async function disconnectMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}