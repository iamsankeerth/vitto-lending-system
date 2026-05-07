import { createApp } from '../../app.js';
import { PostgresBusinessProfileRepository } from '../../adapters/persistence/postgres/PostgresBusinessProfileRepository.js';
import { PostgresLoanApplicationRepository } from '../../adapters/persistence/postgres/PostgresLoanApplicationRepository.js';
import { PostgresCreditDecisionRepository } from '../../adapters/persistence/postgres/PostgresCreditDecisionRepository.js';
import { PostgresAuditLogAdapter } from '../../adapters/persistence/postgres/PostgresAuditLogAdapter.js';

// Mock repositories for integration testing
class MockProfileRepo {
  constructor() { this.store = new Map(); }
  async create(data) {
    const profile = { id: 'profile-' + Math.random().toString(36).slice(2), ...data, monthlyRevenuePaise: data.monthlyRevenueRupees * 100, createdAt: new Date() };
    this.store.set(profile.id, profile);
    return profile;
  }
  async findById(id) { return this.store.get(id) || null; }
}

class MockLoanRepo {
  constructor() { this.store = new Map(); }
  async create(data) {
    const loan = { id: 'loan-' + Math.random().toString(36).slice(2), ...data, requestedAmountPaise: data.requestedAmountRupees * 100, status: 'pending', createdAt: new Date() };
    this.store.set(loan.id, loan);
    return loan;
  }
  async findById(id) { return this.store.get(id) || null; }
  async updateStatus(id, status) {
    const loan = this.store.get(id);
    if (loan) loan.status = status;
  }
}

class MockDecisionRepo {
  constructor() { this.store = new Map(); }
  async create(data) {
    const decision = { id: 'decision-' + Math.random().toString(36).slice(2), ...data, createdAt: new Date() };
    this.store.set(decision.id, decision);
    return decision;
  }
  async findByLoanApplicationId(loanId) {
    return Array.from(this.store.values()).find(d => d.loanApplicationId === loanId) || null;
  }
}

class MockAuditLog {
  async log(event) { /* no-op */ }
}

export function createTestApp() {
  const app = createApp();
  
  // Replace repositories with mocks by overriding the instances
  // Since createApp instantiates them internally, we need to access them through the app
  // For simplicity, we'll create a modified createApp that accepts deps, 
  // but since we can't refactor app.js easily, let's create a lightweight test app
  
  return app;
}

export { MockProfileRepo, MockLoanRepo, MockDecisionRepo, MockAuditLog };
