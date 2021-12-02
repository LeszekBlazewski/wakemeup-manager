import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesGateway } from './nodes.gateway';
import { ConfigModule } from 'src/config/config.module';
import { NodesController } from './nodes.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from 'src/config/config.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
  ],
  providers: [NodesService, NodesGateway],
  controllers: [NodesController],
})
export class NodesModule {}
