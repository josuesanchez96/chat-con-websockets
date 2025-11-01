import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express()
const PORT = process.env.PORT ?? 4000
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000'

app.use(cors({ origin: CORS_ORIGIN }))
app.get('/', (_req, res) => res.json({ ok: true, service: 'chat-websocket2.0-backend' }))

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: CORS_ORIGIN } })

// Estado en memoria (para el ejercicio) 
const rooms = new Map() 
for (const r of ['general', 'soporte', 'random']) rooms.set(r, { users: new Map(), messages: [] })

const ensureRoom = (name) => {
  if (!name || typeof name !== 'string') return null
  if (!rooms.has(name)) rooms.set(name, { users: new Map(), messages: [] })
  return rooms.get(name)
}
const roomNames = () => Array.from(rooms.keys()).sort()

io.on('connection', (socket) => {
  const username = (socket.handshake.auth?.username || '').trim()
  if (!username) {
    socket.emit('auth:error', { ok: false, error: 'Alias requerido' })
    socket.disconnect(true)
    return
  }

  socket.data.username = username
  socket.data.currentRoom = null

  socket.on('room:list', (_p, cb) => cb?.({ ok: true, rooms: roomNames() }))

  socket.on('room:create', ({ room }, cb) => {
    const name = String(room || '').trim()
    if (!name) return cb?.({ ok: false, error: 'Nombre de sala requerido' })
    if (rooms.has(name)) return cb?.({ ok: false, error: 'La sala ya existe' })
    rooms.set(name, { users: new Map(), messages: [] })
    io.emit('room:created', { room: name })
    cb?.({ ok: true, room: name })
  })

  socket.on('room:join', ({ room }, cb) => {
    const name = String(room || '').trim()
    const r = ensureRoom(name)
    if (!r) return cb?.({ ok: false, error: 'Sala inválida' })

    if (socket.data.currentRoom) {
      const prev = rooms.get(socket.data.currentRoom)
      if (prev) {
        prev.users.delete(socket.id)
        socket.leave(socket.data.currentRoom)
        io.to(socket.data.currentRoom).emit('presence:update', {
          room: socket.data.currentRoom,
          users: Array.from(prev.users.values())
        })
      }
    }

    r.users.set(socket.id, socket.data.username)
    socket.join(name)
    socket.data.currentRoom = name

    io.to(name).emit('presence:update', { room: name, users: Array.from(r.users.values()) })
    cb?.({ ok: true, room: name, messages: r.messages.slice(-100) })
  })

  socket.on('room:leave', (_p, cb) => {
    const name = socket.data.currentRoom
    if (!name) return cb?.({ ok: true })
    const r = rooms.get(name)
    if (r) {
      r.users.delete(socket.id)
      socket.leave(name)
      io.to(name).emit('presence:update', { room: name, users: Array.from(r.users.values()) })
    }
    socket.data.currentRoom = null
    cb?.({ ok: true })
  })

  socket.on('typing', ({ room, isTyping }) => {
    const name = room || socket.data.currentRoom
    if (!name) return
    socket.to(name).emit('typing', { user: socket.data.username, isTyping: !!isTyping })
  })

  socket.on('message:send', ({ room, content }, cb) => {
    const name = (room || socket.data.currentRoom || '').trim()
    const text = (content || '').toString().trim()
    if (!name) return cb?.({ ok: false, error: 'Sala no especificada' })
    if (!text) return cb?.({ ok: false, error: 'Mensaje vacío' })

    const r = ensureRoom(name)
    if (!r) return cb?.({ ok: false, error: 'Sala inválida' })

    const msg = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      user: socket.data.username,
      content: text,
      ts: Date.now()
    }
    r.messages.push(msg)
    if (r.messages.length > 500) r.messages.shift()

    io.to(name).emit('message:new', { room: name, message: msg })
    cb?.({ ok: true })
  })

  socket.on('disconnect', () => {
    const name = socket.data.currentRoom
    if (!name) return
    const r = rooms.get(name)
    if (!r) return
    r.users.delete(socket.id)
    io.to(name).emit('presence:update', { room: name, users: Array.from(r.users.values()) })
  })
})

httpServer.listen(PORT, () => console.log(` Backend en http://localhost:${PORT}`))
