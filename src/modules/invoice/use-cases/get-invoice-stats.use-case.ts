import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { StatusRepository } from '../../status/repositories/status.repository';
import { StatusInfoResponseDto } from '../../status/dto/status-info-response.dto';
import { Invoice } from '../../../shared/entities/invoice.entity';

export interface ByStatusEntry {
  status: StatusInfoResponseDto | null;
  count: number;
}

@Injectable()
export class GetInvoiceStatsUseCase {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: MongoRepository<Invoice>,
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute() {
    const allInvoices = await this.invoiceRepository.find({
      where: { deletedAt: null },
    });

    const statuses = await this.statusRepository.findAll(false, {});
    const statusMap = new Map(
      statuses.data.map((s) => [
        s._id.toString(),
        StatusInfoResponseDto.fromEntity(s),
      ]),
    );

    const totalCount = allInvoices.length;
    const totalRevenue = allInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0,
    );

    const countByStatusId = allInvoices.reduce(
      (acc, inv) => {
        const key = inv.statusId?.toString() || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus: ByStatusEntry[] = Object.entries(countByStatusId).map(
      ([id, count]) => ({
        status: statusMap.get(id) ?? null,
        count,
      }),
    );

    const revenueByMonth = allInvoices.reduce(
      (acc, inv) => {
        if (inv.createdAt) {
          const d = new Date(inv.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          acc[key] = (acc[key] || 0) + (inv.total || 0);
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = allInvoices
      .filter((inv) => inv.createdAt && new Date(inv.createdAt) >= today)
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const monthRevenue = allInvoices
      .filter((inv) => inv.createdAt && new Date(inv.createdAt) >= thisMonth)
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
