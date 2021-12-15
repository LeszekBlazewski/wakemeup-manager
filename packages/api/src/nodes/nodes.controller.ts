import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NodesGateway } from './nodes.gateway';
import { NodesService } from './nodes.service';
import { BootTokenCreateDto } from './dto/boot-token-create.dto';
import { JwtBootAuthGuard as JwtBootAuthGuard } from 'src/auth/jwt-boot-auth.guard';
import { NodeState, OS } from './interfaces/NodeState.interfaces';
import { BootTokenDto } from './dto/boot-token.dto';
import { JwtService } from '@nestjs/jwt';
@Controller('nodes')
@ApiTags('nodes')
export class NodesController {
  constructor(
    private nodesService: NodesService,
    private nodesGateway: NodesGateway,
    private jwtService: JwtService,
  ) {
    this.checkStates();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('boot-tokens')
  public async createBootToken(@Body() bootDto: BootTokenCreateDto) {
    if (bootDto.changePassword) {
      const state = this.nodesService.getState(bootDto.host);
      await this.nodesService.changePassword(state, bootDto.password);
    }
    return {
      boot_token: await this.nodesService.generateBootToken(bootDto),
    };
  }

  @UseGuards(JwtBootAuthGuard)
  @Post('boot')
  public async bootByToken(@Body() bootDto: BootTokenDto) {
    const payload = this.jwtService.decode(
      bootDto.boot_token,
    ) as Partial<NodeState>;
    const state = this.nodesService.getState(payload.host);
    this.nodesGateway.wrapAction(state, (state) => {
      return this.nodesService.boot(state, payload.os || OS.UBUNTU);
    });
  }
}
