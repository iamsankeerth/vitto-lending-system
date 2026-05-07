import { v4 as uuidv4 } from 'uuid';
import { pool } from './pool.js';
import { BusinessProfile } from '../../../domain/entities/BusinessProfile.js';

export class PostgresBusinessProfileRepository {
  async create(profileData) {
    const id = uuidv4();
    const { ownerName, pan, businessType, monthlyRevenuePaise } = profileData;
    const query = `
      INSERT INTO business_profiles (id, owner_name, pan, business_type, monthly_revenue_paise, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [id, ownerName, pan, businessType, monthlyRevenuePaise];
    const result = await pool.query(query, values);
    return this._toEntity(result.rows[0]);
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM business_profiles WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this._toEntity(result.rows[0]);
  }

  _toEntity(row) {
    return new BusinessProfile({
      id: row.id,
      ownerName: row.owner_name,
      pan: row.pan,
      businessType: row.business_type,
      monthlyRevenuePaise: Number(row.monthly_revenue_paise),
      createdAt: row.created_at,
    });
  }
}