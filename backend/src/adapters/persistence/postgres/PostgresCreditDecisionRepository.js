import { v4 as uuidv4 } from 'uuid';
import { pool } from './pool.js';
import { CreditDecision } from '../../../domain/entities/CreditDecision.js';

export class PostgresCreditDecisionRepository {
  async create(decisionData) {
    const id = uuidv4();
    const {
      loanApplicationId,
      status,
      creditScore,
      reasonCodes,
      estimatedEmiPaise,
      derivedMetrics,
    } = decisionData;
    const query = `
      INSERT INTO credit_decisions (id, loan_application_id, decision_status, credit_score, reason_codes, estimated_emi_paise, derived_metrics_json, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const values = [
      id,
      loanApplicationId,
      status,
      creditScore,
      JSON.stringify(reasonCodes),
      estimatedEmiPaise,
      JSON.stringify(derivedMetrics),
    ];
    const result = await pool.query(query, values);
    return this._toEntity(result.rows[0]);
  }

  async findByLoanApplicationId(loanApplicationId) {
    const result = await pool.query(
      'SELECT * FROM credit_decisions WHERE loan_application_id = $1 ORDER BY created_at DESC LIMIT 1',
      [loanApplicationId]
    );
    if (result.rows.length === 0) return null;
    return this._toEntity(result.rows[0]);
  }

  _toEntity(row) {
    return new CreditDecision({
      id: row.id,
      loanApplicationId: row.loan_application_id,
      status: row.decision_status,
      creditScore: row.credit_score,
      reasonCodes: Array.isArray(row.reason_codes) ? row.reason_codes : JSON.parse(row.reason_codes),
      estimatedEmiPaise: Number(row.estimated_emi_paise),
      derivedMetrics: typeof row.derived_metrics_json === 'string' ? JSON.parse(row.derived_metrics_json) : row.derived_metrics_json,
      createdAt: row.created_at,
    });
  }
}