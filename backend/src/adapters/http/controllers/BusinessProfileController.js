import { success } from '../presenters/ApiPresenter.js';

export class BusinessProfileController {
  constructor(createUseCase) {
    this.createUseCase = createUseCase;
  }

  create = async (req, res, next) => {
    try {
      const dto = req.body;
      const profile = await this.createUseCase.execute(dto);
      res.status(201).json(success({
        id: profile.id,
        ownerName: profile.ownerName,
        pan: profile.pan.toString(),
        businessType: profile.businessType,
        monthlyRevenueRupees: profile.getMonthlyRevenueRupees(),
        createdAt: profile.createdAt,
      }, { requestId: req.requestId }));
    } catch (err) {
      next(err);
    }
  };
}