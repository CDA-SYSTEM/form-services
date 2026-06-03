import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Invoice } from '../../../shared/entities/invoice.entity';

@Injectable()
export class GetInvoiceStatsUseCase {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: MongoRepository<Invoice>,
  ) {}

  async execute() {
    const allInvoices = await this.invoiceRepository.find({ where: { deletedAt: null } });
    
    const totalCount = allInvoices.length;
    const totalRevenue = allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const byStatus = allInvoices.reduce((acc, inv) => {
      const key = inv.statusId?.toString() || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const revenueByMonth = allInvoices.reduce((acc, inv) => {
      if (inv.createdAt) {
        const d = new Date(inv.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + (inv.total || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = allInvoices
      .filter(inv => inv.createdAt && new Date(inv.createdAt) >= today)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthRevenue = allInvoices
      .filter(inv => inv.createdAt && new Date(inv.createdAt) >= thisMonth)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    return {
      totalInvoices: totalCount,
      totalRevenue,
      todayRevenue,
      monthRevenue,
      byStatus,
      revenueByMonth,
    };
  }
}
