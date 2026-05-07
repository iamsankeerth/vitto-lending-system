import { v4 as uuidv4 } from 'uuid';
import { pool } from './pool.js';
import { LoanApplication } from '../../../domain/entities/LoanApplication.js';

export class PostgresLoanApplicationRepository {
  async create(applicationData) {
    const id = uuidv4();
    const { businessProfileId, requestedAmountPaise, tenureMonths, purpose } = applicationData;
    const query = `
      INSERT INTO loan_applications (id, business_profile_id, requested_amount_paise, tenure_months, purpose, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
      RETURNING *
    `;
    const values = [id, businessProfileId, requestedAmountPaise, tenureMonths, purpose];
    const result = await pool.query(query, values);
    return this._toEntity(result.rows[0]);
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM loan_applications WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this._toEntity(result.rows[0]);
  }

  async updateStatus(id, status) {
    await pool.query('UPDATE loan_applications SET status = $1 WHERE id = $2', [status, id]);
  }

  _toEntity(row) {
    return new LoanApplication({
      id: row.id,
      businessProfileId: row.business_profile_id,
      requestedAmountPaise: Number(row.requested_amount_paise),
      tenureMonths: row.tenure_months,
      purpose: row.purpose,
      status: row.status,
      createdAt: row.created_at,
    });
  }
}