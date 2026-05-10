import { Global, Module } from '@nestjs/common';
import { FormDomainValidationService } from './form-domain-validation.service';

@Global()
@Module({
  providers: [FormDomainValidationService],
  exports: [FormDomainValidationService],
})
export class RabbitMQModule {}
