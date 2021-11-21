import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { NodesModule } from './nodes/nodes.module';

@Module({
  imports: [AuthModule, ConfigModule, NodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
