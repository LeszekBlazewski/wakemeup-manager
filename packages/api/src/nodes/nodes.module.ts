import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesGateway } from './nodes.gateway';
import { ConfigModule } from 'src/config/config.module';
import { NodesController } from './nodes.controller';

@Module({
  imports: [ConfigModule],
  providers: [NodesService, NodesGateway],
  controllers: [NodesController],
})
export class NodesModule {}
