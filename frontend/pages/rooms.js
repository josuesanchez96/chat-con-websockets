import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSocket, disconnectSocket } from '../lib/socket'

export default function Rooms() {
  const router = useRouter()
  const [socket, setSocket] = useState(null)
  const [rooms, setRooms] = useState([])
  const [newRoom, setNewRoom] = useState('')

  useEffect(() => {
    const nick = localStorage.getItem('nickname')
    if (!nick) { router.replace('/'); return }
    const s = getSocket(nick)
    s.connect()

    s.on('connect', () => s.emit('room:list', null, res => res?.ok && setRooms(res.rooms)))
    s.on('room:created', ({ room }) => setRooms(prev => [...new Set([...prev, room])].sort()))

    setSocket(s)
    return () => { s.off('room:created'); s.disconnect(); disconnectSocket() }
  }, [router])

  const createRoom = (e) => {
    e.preventDefault()
    const r = newRoom.trim()
    if (!r) return
    socket.emit('room:create', { room: r }, (res) => {
      if (!res?.ok) alert(res.error || 'No se pudo crear la sala')
      else setNewRoom('')
    })
  }

  return (
    <div className="container">
      <h2>Salas</h2>
      <div className="card">
        <form onSubmit={createRoom} className="row">
          <input className="input" placeholder="Crear nueva sala" value={newRoom} onChange={e=>setNewRoom(e.target.value)} />
          <button className="button">Crear</button>
        </form>
        <hr className="hr" />
        <ul className="list">
          {rooms.map(r => (
            <li key={r} className="row" style={{justifyContent:'space-between'}}>
              <span>{r}</span>
              <button className="button" onClick={()=>router.push(`/room/${encodeURIComponent(r)}`)}>Entrar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
