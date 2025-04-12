export class IIntegrationSubscription {
  constructor(
    public customerId: string,
    public planId: string,
    public integrationProductId: string,
    public termPeriod: number,
    // [TODO] add more fields
  ) {}
}
