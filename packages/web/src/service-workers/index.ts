declare const self: ServiceWorkerGlobalScope;

import { io, Socket } from 'socket.io-client';
import { MessageType, SocketEvent } from './constants';
import { initialize } from './install';
import { MessageEventData } from './interfaces';

initialize();

let socket: Socket;

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (socket && socket.connected) return;

  const data: MessageEventData = event.data;

  if (data.type === MessageType.CONNECT) {
    socket = io(data.url, {
      transports: ['websocket'],
      path: '/sock/notification',
      auth: { token: data.auth },
    });

    socket.on(SocketEvent.CONNECT, () => {
      socket.emit('join');
      console.log('Socket connected ✅');
    });

    socket.on(SocketEvent.DISCONNECT, () => {
      console.log('Socket disconnected ❌');
    });

    socket.on(SocketEvent.GLOBAL, async (msg) => {
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage(msg);
      });
    });

    socket.on(data.userId, async (msg) => {
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage(msg);
      });
    });

    socket.on(SocketEvent.CONNECT_ERROR, function (err) {
      console.error('Connection Failed 😭 : ' + err);
    });
  }
});
