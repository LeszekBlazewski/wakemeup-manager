import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { NodesModule } from './nodes/nodes.module';

@Module({
  imports: [AuthModule, ConfigModule, NodesModule, ScheduleModule.forRoot()],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
