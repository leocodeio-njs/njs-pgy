export class IIntegrationUser {
  constructor(
    public name: string,
    public email: string,
    public phone: string,
    public customerId: string,
    public integrationUserId: string,
  ) {}
}
