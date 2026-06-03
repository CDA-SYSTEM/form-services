import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Inspection } from '../../../shared/entities/inspection.entity';

@Injectable()
export class GetInspectionStatsUseCase {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: MongoRepository<Inspection>,
  ) {}

  async execute() {
    const allInspections = await this.inspectionRepository.find({ where: { deletedAt: null } });
    
    const totalCount = allInspections.length;
    
    const byStatus = allInspections.reduce((acc, i) => {
      const key = i.statusId?.toString() || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byVehicleType = allInspections.reduce((acc, i) => {
      const key = i.vehicle_type || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byServiceType = allInspections.reduce((acc, i) => {
      const key = i.service_type || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = allInspections.filter(i => {
      const d = new Date(i.date || i.inspection_date);
      return d >= today;
    }).length;

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);
    
    const weekCount = allInspections.filter(i => {
      const d = new Date(i.date || i.inspection_date);
      return d >= thisWeek;
    }).length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthCount = allInspections.filter(i => {
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
