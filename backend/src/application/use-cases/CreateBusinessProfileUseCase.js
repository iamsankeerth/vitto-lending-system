export class CreateBusinessProfileUseCase {
  constructor(profileRepo, auditLog) {
    this.profileRepo = profileRepo;
    this.auditLog = auditLog;
  }

  async execute(dto) {
    const profile = await this.profileRepo.create(dto);
    await this.auditLog.log({
      eventType: 'PROFILE_CREATED',
      businessProfileId: profile.id,
      payload: { request: dto, response: { id: profile.id } },
    });
    return profile;
  }
}