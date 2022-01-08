export class BulbNotFoundError extends Error {
  public message: string;

  constructor(id: string) {
    const message = `Bulb with id: ${id} not found`;
    super(message);
    this.message = message;
  }
}
