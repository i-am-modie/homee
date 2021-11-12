export class BulbNotFoundError extends Error {
  constructor(id: string) {
    super(`Bulb with ${id} not found`);
  }
}
