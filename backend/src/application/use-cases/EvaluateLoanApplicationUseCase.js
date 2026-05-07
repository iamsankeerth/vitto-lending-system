import { DecisionEngine } from '../../domain/services/DecisionEngine.js';
import { config } from '../../infrastructure/config/env.js';

export class EvaluateLoanApplicationUseCase {
  constructor(loanRepo, profileRepo, decisionRepo, auditLog) {
    this.loanRepo = loanRepo;
    this.profileRepo = profileRepo;
    this.decisionRepo = decisionRepo;
    this.auditLog = auditLog;
    this.engine = new DecisionEngine(config.annualInterestRatePct);
  }

  async execute(loanApplicationId) {
    const application = await this.loanRepo.findById(loanApplicationId);
    if (!application) {
      const error = new Error('Loan application not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const profile = await this.profileRepo.findById(application.businessProfileId);
    if (!profile) {
      const error = new Error('Business profile not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const result = this.engine.evaluate(profile, application);

    await this.loanRepo.updateStatus(loanApplicationId, result.status);

    const decision = await this.decisionRepo.create({
      loanApplicationId,
      status: result.status,
      creditScore: result.creditScore,
      reasonCodes: result.reasonCodes,
      estimatedEmiPaise: result.estimatedEmiPaise,
      derivedMetrics: result.derivedMetrics,
    });

    await this.auditLog.log({
      eventType: 'DECISION_CREATED',
      businessProfileId: profile.id,
      loanApplicationId: application.id,
      decisionId: decision.id,
      payload: {
        request: { loanApplicationId },
        response: {
          status: result.status,
          creditScore: result.creditScore,
          reasonCodes: result.reasonCodes,
          derivedMetrics: result.derivedMetrics,
        },
      },
    });

    return decision;
  }
}