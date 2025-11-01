import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { getSocket, disconnectSocket } from '../../lib/socket'

export default function Room() {
  const router = useRouter()
  const { room } = router.query
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [text, setText] = useState('')
  const [typingUsers, setTypingUsers] = useState(new Set())

  const listRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const nick = localStorage.getItem('nickname')
    if (!nick) { router.replace('/'); return }
    if (!room) return

    const s = getSocket(nick)
    s.connect()

    s.on('connect', () => {
      s.emit('room:join', { room }, (res) => {
        if (!res?.ok) { alert(res?.error || 'No se pudo entrar a la sala'); router.replace('/rooms'); return }
        setMessages(res.messages || [])
      })
    })
    s.on('message:new', ({ room: r, message }) => {
      if (r !== room) return
      setMessages(prev => [...prev, message])
      requestAnimationFrame(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight })
    })
    s.on('presence:update', ({ room: r, users }) => { if (r === room) setUsers(users) })
    s.on('typing', ({ user, isTyping }) => {
      setTypingUsers(prev => { const next = new Set(prev); isTyping ? next.add(user) : next.delete(user); return next })
    })

    setSocket(s)
    return () => {
      s.emit('room:leave', null, () => {})
      s.off('message:new'); s.off('presence:update'); s.off('typing')
      s.disconnect(); disconnectSocket()
    }
  }, [room, router])

  const send = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    socket.emit('message:send', { room, content: t }, (res) => {
      if (!res?.ok) alert(res.error || 'No se pudo enviar'); else setText('')
    })
  }

  const handleTyping = (value) => {
    setText(value)
    if (!socket) return
    socket.emit('typing', { room, isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit('typing', { room, isTyping: false }), 1000)
  }

  const fmt = (ts) => new Date(ts).toLocaleTimeString()

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h2>{room}</h2>
        <a href="/rooms">← Volver</a>
      </div>

      <div className="card stack">
        <div className="presence">{users.map(u => <span key={u} className="pill">● {u}</span>)}</div>

        <div className="chat">
          <div className="messages" ref={listRef}>
            <div className="stack">
              {messages.map(m => (
                <div key={m.id} className="msg">
                  <div className="user">{m.user} <span className="badge">{fmt(m.ts)}</span></div>
                  <div>{m.content}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={send} className="row">
            <input className="input" placeholder="Escribe un mensaje…" value={text} onChange={e => handleTyping(e.target.value)} maxLength={500} />
            <button className="button">Enviar</button>
          </form>
        </div>

        <div className="typing">{[...typingUsers].length ? `${[...typingUsers].join(', ')} está(n) escribiendo…` : ''}</div>
      </div>
    </div>
  )
}
