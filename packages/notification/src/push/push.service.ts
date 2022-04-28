import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import JwtAuthGuard from '@seaccentral/core/dist/auth/jwtAuth.guard';
import { User } from '@seaccentral/core/dist/user/User.entity';

import { instrument } from '@socket.io/admin-ui';

const event = 'seac';

@WebSocketGateway({
  transports: ['websocket'],
  path: '/sock/notification', // path is to let it work when server is behind load-balancer
  cors: {
    origin: '*',
    methods: '*',
    credentials: true,
  },
})
@Injectable()
export class PushService implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PushService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (this.configService.get('NODE_ENV', 'development') === 'development')
      instrument(this.server, {
        auth: {
          type: 'basic',
          username: this.configService.get('SOCKET_ADMIN_USER', ''),
          password: this.configService.get('SOCKET_ADMIN_PASSWORD', ''),
        },
      });
  }

  /**
   * Publish {data} to a specific {roomId} or broadcast to all
   * @param data
   * @param roomId
   */
  async publish(data: unknown, roomId?: string) {
    if (roomId) {
      this.server.to(roomId).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  /**
   * This function is listening to client if it wants to join the room.
   * Client doesn't need to decide which room it should/would join. Just supply token and server will decide here.
   * @param client
   */
  @SubscribeMessage('join')
  @UseGuards(JwtAuthGuard)
  joinRoom(client: Socket & { user: User }) {
    try {
      if (!client.user) throw new WsException('No available room');

      client.join(client.user.id);
    } catch (err) {
      this.logger.error(err);
    }
  }
}
