export class IIntegrationUser {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public phone: string,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date,
  ) {}
}
