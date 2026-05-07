import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './infrastructure/config/env.js';
import { createLogger } from './infrastructure/logging/logger.js';

import { PostgresBusinessProfileRepository } from './adapters/persistence/postgres/PostgresBusinessProfileRepository.js';
import { PostgresLoanApplicationRepository } from './adapters/persistence/postgres/PostgresLoanApplicationRepository.js';
import { PostgresCreditDecisionRepository } from './adapters/persistence/postgres/PostgresCreditDecisionRepository.js';
import { MongoAuditLogAdapter } from './adapters/persistence/mongo/MongoAuditLogAdapter.js';

import { CreateBusinessProfileUseCase } from './application/use-cases/CreateBusinessProfileUseCase.js';
import { CreateLoanApplicationUseCase } from './application/use-cases/CreateLoanApplicationUseCase.js';
import { EvaluateLoanApplicationUseCase } from './application/use-cases/EvaluateLoanApplicationUseCase.js';
import { GetLoanApplicationDetailsUseCase } from './application/use-cases/GetLoanApplicationDetailsUseCase.js';

import { BusinessProfileController } from './adapters/http/controllers/BusinessProfileController.js';
import { LoanApplicationController } from './adapters/http/controllers/LoanApplicationController.js';
import { DecisionController } from './adapters/http/controllers/DecisionController.js';

import { createBusinessProfileRoutes } from './adapters/http/routes/businessProfileRoutes.js';
import { createLoanApplicationRoutes } from './adapters/http/routes/loanApplicationRoutes.js';
import { createDecisionRoutes } from './adapters/http/routes/decisionRoutes.js';
import { createHealthRoutes } from './adapters/http/routes/healthRoutes.js';

import { requestIdMiddleware } from './adapters/http/middleware/requestId.js';
import { errorHandler } from './adapters/http/middleware/errorHandler.js';
import { notFound } from './adapters/http/middleware/notFound.js';

export function createApp() {
  const app = express();
  const logger = createLogger();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use(requestIdMiddleware);

  // Repositories & Adapters
  const profileRepo = new PostgresBusinessProfileRepository();
  const loanRepo = new PostgresLoanApplicationRepository();
  const decisionRepo = new PostgresCreditDecisionRepository();
  const auditLog = new MongoAuditLogAdapter();

  // Use Cases
  const createProfileUseCase = new CreateBusinessProfileUseCase(profileRepo, auditLog);
  const createLoanUseCase = new CreateLoanApplicationUseCase(loanRepo, profileRepo, auditLog);
  const evaluateUseCase = new EvaluateLoanApplicationUseCase(loanRepo, profileRepo, decisionRepo, auditLog);
  const getDetailsUseCase = new GetLoanApplicationDetailsUseCase(loanRepo, profileRepo, decisionRepo);

  // Controllers
  const profileController = new BusinessProfileController(createProfileUseCase);
  const loanController = new LoanApplicationController(createLoanUseCase, getDetailsUseCase);
  const decisionController = new DecisionController(evaluateUseCase);

  // Routes
  app.use('/api/health', createHealthRoutes());
  app.use('/api/business-profiles', createBusinessProfileRoutes(profileController));
  app.use('/api/loan-applications', createLoanApplicationRoutes(loanController));
  app.use('/api/loan-applications', createDecisionRoutes(decisionController));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}