export class BusinessProfileRepository {
  async create(profile) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
}

export class LoanApplicationRepository {
  async create(application) { throw new Error('Not implemented'); }
  async findById(id) { throw new Error('Not implemented'); }
  async updateStatus(id, status) { throw new Error('Not implemented'); }
}

export class CreditDecisionRepository {
  async create(decision) { throw new Error('Not implemented'); }
  async findByLoanApplicationId(loanApplicationId) { throw new Error('Not implemented'); }
}

export class AuditLogPort {
  async log(event) { throw new Error('Not implemented'); }
}