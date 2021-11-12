export class ValidationError extends Error {
  constructor(field: string, constraint: string) {
    super(`Validation error: ${field} must be: ${constraint}`);
  }
}
