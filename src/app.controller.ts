import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @ApiOperation({ summary: 'Health check del microservicio' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        service: 'form-service',
      },
    },
  })
  @Get()
  healthCheck(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'form-service',
    };
  }
}
