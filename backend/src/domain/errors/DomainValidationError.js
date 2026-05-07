export class DomainValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'DomainValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}