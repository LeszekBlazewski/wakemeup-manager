import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ConfigService } from 'src/config/config.service';
import * as jwt from 'jsonwebtoken';
import { NodesService } from './nodes.service';

@WebSocketGateway({ cors: true })
export class NodesGateway {
  @WebSocketServer()
  public wsServer: Server;

  constructor(
    private configService: ConfigService,
    private nodesService: NodesService,
  ) {}

  handleConnection(client: Socket) {
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
    console.log(client);

    this.nodesService.getStates().forEach((state) => {
      client.emit('node/state', state);
    });

    return client;
  }
}
