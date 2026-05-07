import { success } from '../presenters/ApiPresenter.js';

export class DecisionController {
  constructor(evaluateUseCase) {
    this.evaluateUseCase = evaluateUseCase;
  }

  evaluate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const decision = await this.evaluateUseCase.execute(id);
      res.status(200).json(success({
        applicationId: decision.loanApplicationId,
        decisionId: decision.id,
        status: decision.status,
        creditScore: decision.creditScore,
        reasonCodes: decision.reasonCodes,
        derivedMetrics: decision.derivedMetrics,
        estimatedEmiRupees: decision.estimatedEmi / 100,
        createdAt: decision.createdAt,
      }, { requestId: req.requestId }));
    } catch (err) {
      next(err);
    }
  };
}