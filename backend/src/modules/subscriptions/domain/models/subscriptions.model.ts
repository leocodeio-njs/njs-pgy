export class IIntegrationSubscription {
  constructor(
    public integrationProductId: string,
    public integrationUserId?: string,
    public pgySubscriptionId?: string,
    // [TODO] add more fields
  ) {}
}
