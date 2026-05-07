export class CreateLoanApplicationUseCase {
  constructor(loanRepo, profileRepo, auditLog) {
    this.loanRepo = loanRepo;
    this.profileRepo = profileRepo;
    this.auditLog = auditLog;
  }

  async execute(dto) {
    const profile = await this.profileRepo.findById(dto.businessProfileId);
    if (!profile) {
      const error = new Error('Business profile not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const application = await this.loanRepo.create(dto);
    await this.auditLog.log({
      eventType: 'APPLICATION_CREATED',
      businessProfileId: dto.businessProfileId,
      loanApplicationId: application.id,
      payload: { request: dto, response: { id: application.id } },
    });
    return application;
  }
}