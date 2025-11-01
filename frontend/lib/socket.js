import { io } from 'socket.io-client'
let socket = null

export function getSocket(username) {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
    socket = io(url, { autoConnect: false, auth: { username } })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null }
}
