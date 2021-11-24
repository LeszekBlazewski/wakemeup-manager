import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ConfigService } from 'src/config/config.service';
import * as jwt from 'jsonwebtoken';
import { NodesService } from './nodes.service';
import { NodeState, OS } from 'src/types';

@WebSocketGateway({ cors: true, path: '/api/cluster/socket.io' })
export class NodesGateway {
  @WebSocketServer()
  public wsServer: Server;

  constructor(
    private configService: ConfigService,
    private nodesService: NodesService,
  ) {}

  public handleConnection(client: Socket) {
    const authToken: string = client.handshake.auth.token;
    try {
      if (this.configService.isProd()) {
        jwt.verify(
          authToken.slice(7),
          this.configService.createSecretOptions().secret,
        );
      }
    } catch (e) {
      client.emit('error', 'Not authorized!');
      client.disconnect(true);
    }

    this.emitStates(...this.nodesService.getStates());

    return client;
  }

  public emitStates(...states: NodeState[]) {
    states.forEach((state) => {
      this.wsServer.emit('node/state', state);
    });
  }

  @SubscribeMessage('node/shutdown')
  public async handleShutdown(
    @MessageBody() state: NodeState | NodeState[],
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    (state instanceof Array ? state : [state]).forEach(async (state) => {
      await this.wrapAction(state, async (_state) => {
        return await this.nodesService.shutdown(_state);
      });
    });
  }

  @SubscribeMessage(`node/boot/${OS.UBUNTU}`)
  public async handleBootUbuntu(
    @MessageBody() state: NodeState | NodeState[],
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    (state instanceof Array ? state : [state]).forEach(async (state) => {
      await this.wrapAction(state, async (_state) => {
        return await this.nodesService.boot(_state, OS.UBUNTU);
      });
    });
  }

  @SubscribeMessage(`node/boot/${OS.WINDOWS}`)
  public async handleBootWindows(
    @MessageBody() state: NodeState | NodeState[],
    @ConnectedSocket() _client: Socket,
  ): Promise<void> {
    (state instanceof Array ? state : [state]).forEach(async (state) => {
      await this.wrapAction(state, async (_state) => {
        return await this.nodesService.boot(_state, OS.WINDOWS);
      });
    });
  }

  private async wrapAction(
    state: NodeState,
    action: (state: NodeState) => Promise<NodeState>,
  ) {
    const beforeState = {
      ...this.nodesService.getState(state.host),
      actionPending: true,
    };
    this.nodesService.setState(beforeState);
    this.emitStates(beforeState);

    const afterState = {
      ...(await action(beforeState)),
      actionPending: false,
    };
    this.nodesService.setState(afterState);
    this.emitStates(afterState);
  }
}
