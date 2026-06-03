import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

const startTime = Date.now();

@ApiTags('health')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Health check del microservicio' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'form-service',
        uptime: 12345,
      },
    },
  })
  @Get()
  healthCheck(): { status: string; service: string; uptime: number } {
    return {
      status: 'ok',
      service: 'form-service',
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
  }
}
