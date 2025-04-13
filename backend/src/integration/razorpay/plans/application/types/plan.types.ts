import { Item } from '@/integration/razorpay/items/application/types/item.types';

export type Plan = {
  period: PlanPeriod;
  interval: number;
  item: Item;
};

export enum PlanPeriod {
  MONTHLY = 'monthly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
}
