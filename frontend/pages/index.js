import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Login() {
  const router = useRouter()
  const [name, setName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('nickname')
    if (saved) setName(saved)
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    localStorage.setItem('nickname', n)
    router.push('/rooms')
  }

  return (
    <div className="container">
      <h1>Chat en Tiempo Real - UMG - Reu</h1>
      <p className="badge">Realizado por Josue Sanchez</p>
      <div className="card" style={{maxWidth:480}}>
        <h3>Elige un alias</h3>
        <form onSubmit={submit} className="stack">
          <input className="input" placeholder="Tu alias" value={name} onChange={e => setName(e.target.value)} maxLength={24} />
          <button className="button" type="submit">Continuar</button>
        </form>
      </div>
    </div>
  )
}
