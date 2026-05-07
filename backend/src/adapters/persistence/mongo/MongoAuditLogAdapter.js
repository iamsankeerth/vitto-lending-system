import { getDb } from './client.js';

export class MongoAuditLogAdapter {
  async log(event) {
    try {
      const db = getDb();
      const collection = db.collection('audit_events');
      await collection.insertOne({
        ...event,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Audit log write failed:', err.message);
    }
  }
}