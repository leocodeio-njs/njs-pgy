export class IIntegrationSubscription {
  constructor(
    public customerId: string,
    public planId: string,
    public integrationProductId: string,
    public status: string,
    public pgySubscriptionId?: string,
    // [TODO] add more fields
  ) {}
}
