import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesGateway } from './nodes.gateway';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [NodesService, NodesGateway],
})
export class NodesModule {}
