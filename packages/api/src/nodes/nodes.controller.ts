import { Controller } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NodesGateway } from './nodes.gateway';
import { NodesService } from './nodes.service';

@Controller('nodes')
export class NodesController {
  constructor(
    private nodesService: NodesService,
    private nodesGateway: NodesGateway,
  ) {
    this.checkStates();
  }

  @Cron('*/10 * * * * *')
  public checkStates() {
    const oldStates = this.nodesService.getStates();
    oldStates.forEach(async (state) => {
      const newState = await this.nodesService.checkState(state);
      /** Action reports state on success or timeout */
      if (!state.actionPending) {
        this.nodesService.setState(newState);
        this.nodesGateway.emitStates(newState);
      }
    });
  }
}
