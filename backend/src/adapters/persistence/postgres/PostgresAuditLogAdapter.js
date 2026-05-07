import { pool } from './pool.js';

export class PostgresAuditLogAdapter {
  async log(event) {
    try {
      await pool.query(
        `INSERT INTO audit_events (id, event_type, request_id, business_profile_id, loan_application_id, decision_id, payload)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          event.id || crypto.randomUUID(),
          event.eventType,
          event.requestId,
          event.businessProfileId || null,
          event.loanApplicationId || null,
          event.decisionId || null,
          JSON.stringify(event.payload || {}),
        ]
      );
    } catch (err) {
      console.error('Audit log write failed:', err.message);
    }
  }
}
