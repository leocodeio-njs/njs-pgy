export class IIntegrationSubscription {
  constructor(
    public planId: string,
    public integrationProductId: string,
    public status: string,
    public integrationUserId?: string,
    public pgySubscriptionId?: string,
    // [TODO] add more fields
  ) {}
}
