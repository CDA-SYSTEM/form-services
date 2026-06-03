import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
