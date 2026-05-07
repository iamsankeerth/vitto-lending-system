export class GetLoanApplicationDetailsUseCase {
  constructor(loanRepo, profileRepo, decisionRepo) {
    this.loanRepo = loanRepo;
    this.profileRepo = profileRepo;
    this.decisionRepo = decisionRepo;
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
    const decision = await this.decisionRepo.findByLoanApplicationId(loanApplicationId);

    return { application, profile, decision };
  }
}