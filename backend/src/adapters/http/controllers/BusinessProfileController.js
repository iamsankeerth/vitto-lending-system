import { success } from '../presenters/ApiPresenter.js';

export class BusinessProfileController {
  constructor(createUseCase) {
    this.createUseCase = createUseCase;
  }

  create = async (req, res, next) => {
    try {
      const dto = {
        ownerName: req.body.ownerName,
        pan: req.body.pan,
        businessType: req.body.businessType,
        monthlyRevenuePaise: Math.round(req.body.monthlyRevenueRupees * 100),
      };
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