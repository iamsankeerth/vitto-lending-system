import { PanNumber } from '../value-objects/PanNumber.js';
import { Money } from '../value-objects/Money.js';

export class BusinessProfile {
  constructor({ id, ownerName, pan, businessType, monthlyRevenuePaise, createdAt }) {
    this.id = id;
    this.ownerName = ownerName;
    this.pan = pan instanceof PanNumber ? pan : new PanNumber(pan);
    this.businessType = businessType;
    this.monthlyRevenue = new Money(monthlyRevenuePaise);
    this.createdAt = createdAt || new Date();
  }

  getMonthlyRevenueRupees() {
    return this.monthlyRevenue.toRupees();
  }
}