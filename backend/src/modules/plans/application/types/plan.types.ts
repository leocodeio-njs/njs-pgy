import { Item } from '@/modules/items/application/types/item.types';

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
