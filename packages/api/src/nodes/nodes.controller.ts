import { Controller, Get, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NodesGateway } from './nodes.gateway';
import { NodesService } from './nodes.service';

@Controller('nodes')
@ApiTags('nodes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NodesController {
  constructor(
    private nodesService: NodesService,
    private nodesGateway: NodesGateway,
  ) {
    this.checkStates();
  }

  @Cron(`*/${process.env.STATE_CHECK_INTERVAL || 10} * * * * *`)
  @Get('check-states')
  public checkStates() {
    const oldStates = this.nodesService.getStates();
    oldStates.forEach(async (state) => {
      /** Action reports state on success or timeout - report not pending only */
      if (!state.actionPending) {
        const newState = await this.nodesService.checkState(state);
        if (!this.nodesService.getState(state.host).actionPending) {
          this.nodesService.setState(newState);
          this.nodesGateway.emitStates(newState);
        }
      }
    });
  }
}
