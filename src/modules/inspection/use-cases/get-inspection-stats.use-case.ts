import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { StatusRepository } from '../../status/repositories/status.repository';
import { StatusInfoResponseDto } from '../../status/dto/status-info-response.dto';
import { Inspection } from '../../../shared/entities/inspection.entity';

export interface ByStatusEntry {
  status: StatusInfoResponseDto | null;
  count: number;
}

@Injectable()
export class GetInspectionStatsUseCase {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: MongoRepository<Inspection>,
    private readonly statusRepository: StatusRepository,
  ) {}

  async execute() {
    const allInspections = await this.inspectionRepository.find({
      where: { deletedAt: null },
    });

    const statuses = await this.statusRepository.findAll(false, {});
    const statusMap = new Map(
      statuses.data.map((s) => [
        s._id.toString(),
        StatusInfoResponseDto.fromEntity(s),
      ]),
    );

    const totalCount = allInspections.length;

    const countByStatusId = allInspections.reduce(
      (acc, i) => {
        const key = i.statusId?.toString() || 'unknown';
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

    const byVehicleType = allInspections.reduce(
      (acc, i) => {
        const key = i.vehicle_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byServiceType = allInspections.reduce(
      (acc, i) => {
        const key = i.service_type || 'unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = allInspections.filter((i) => {
      const d = new Date(i.date || i.inspection_date);
      return d >= today;
    }).length;

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);

    const weekCount = allInspections.filter((i) => {
      const d = new Date(i.date || i.inspection_date);
      return d >= thisWeek;
    }).length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthCount = allInspections.filter((i) => {
      const d = new Date(i.date || i.inspection_date);
      return d >= thisMonth;
    }).length;

    return {
      totalInspections: totalCount,
      todayInspections: todayCount,
      weekInspections: weekCount,
      monthInspections: monthCount,
      byStatus,
      byVehicleType,
      byServiceType,
    };
  }
}
