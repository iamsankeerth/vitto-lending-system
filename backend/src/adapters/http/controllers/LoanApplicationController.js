import { success } from '../presenters/ApiPresenter.js';

export class LoanApplicationController {
  constructor(createUseCase, getDetailsUseCase) {
    this.createUseCase = createUseCase;
    this.getDetailsUseCase = getDetailsUseCase;
  }

  create = async (req, res, next) => {
    try {
      const dto = req.body;
      const application = await this.createUseCase.execute(dto);
      res.status(201).json(success({
        id: application.id,
        businessProfileId: application.businessProfileId,
        requestedAmountRupees: application.getRequestedAmountRupees(),
        tenureMonths: application.tenure.value,
        purpose: application.purpose,
        status: application.status,
        createdAt: application.createdAt,
      }, { requestId: req.requestId }));
    } catch (err) {
      next(err);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const details = await this.getDetailsUseCase.execute(id);
      res.status(200).json(success({
        application: {
          id: details.application.id,
          businessProfileId: details.application.businessProfileId,
          requestedAmountRupees: details.application.getRequestedAmountRupees(),
          tenureMonths: details.application.tenure.value,
          purpose: details.application.purpose,
          status: details.application.status,
          createdAt: details.application.createdAt,
        },
        profile: details.profile ? {
          id: details.profile.id,
          ownerName: details.profile.ownerName,
          pan: details.profile.pan.toString(),
          businessType: details.profile.businessType,
          monthlyRevenueRupees: details.profile.getMonthlyRevenueRupees(),
        } : null,
        decision: details.decision ? {
          id: details.decision.id,
          status: details.decision.status,
          creditScore: details.decision.creditScore,
          reasonCodes: details.decision.reasonCodes,
          derivedMetrics: details.decision.derivedMetrics,
          estimatedEmiRupees: details.decision.estimatedEmi / 100,
          createdAt: details.decision.createdAt,
        } : null,
      }, { requestId: req.requestId }));
    } catch (err) {
      next(err);
    }
  };
}