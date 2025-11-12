import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useApi(url, options) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!url) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url, options)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [url])

  return { data, loading, error }
}

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center bg-gradient-to-b from-white via-purple-50 to-blue-50">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-400 drop-shadow-sm">
          Qik Office
        </h1>
        <p className="mt-4 text-gray-700 md:text-lg">
          Meet, capture, and act — one workspace for meetings, notes, and to-dos.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="#mvp" className="px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">
            Try the MVP
          </a>
          <a href="#rooms" className="px-5 py-2.5 rounded-lg bg-white/80 backdrop-blur border border-purple-200 text-purple-700 hover:bg-white transition">
            Explore Rooms
          </a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

function Signup({ onSignedUp }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('Bright Media')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company })
      })
      const data = await res.json()
      if (res.ok) {
        onSignedUp({ userId: data.id, apiKey: data.api_key, name, email, company })
      } else {
        setError(data?.detail || 'Sign up failed')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="mvp" className="py-10 px-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow border p-6">
        <h2 className="text-2xl font-bold">Create your workspace</h2>
        <p className="text-gray-600 mt-1">Start by creating a user. We'll create workspaces and rooms next.</p>
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <input className="border rounded px-3 py-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} required />
          <input className="border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="border rounded px-3 py-2" placeholder="Company (e.g., Bright Media)" value={company} onChange={(e)=>setCompany(e.target.value)} />
          <button disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white rounded px-4 py-2 disabled:opacity-60">
            {loading ? 'Creating...' : 'Create user'}
          </button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      </div>
    </section>
  )
}

function WorkspaceCreator({ user, onWorkspace }) {
  const [name, setName] = useState(user?.company || 'Bright Media')
  const [desc, setDesc] = useState('Creative team collaboration space')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, owner_user_id: user.userId, description: desc })
      })
      const data = await res.json()
      if (res.ok) onWorkspace({ id: data.id, name })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-10 px-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-xl font-semibold">Create workspace</h3>
        <div className="mt-3 grid gap-3">
          <input className="border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border rounded px-3 py-2" value={desc} onChange={e=>setDesc(e.target.value)} />
          <button onClick={create} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-60">{loading ? 'Creating...' : 'Create workspace'}</button>
      </div>
      </div>
    </section>
  )
}

function RoomCreator({ workspace, onRoom }) {
  const [name, setName] = useState('Client Review Room')
  const [type, setType] = useState('online')
  const [loading, setLoading] = useState(false)

  const create = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspace.id, name, type })
      })
      const data = await res.json()
      if (res.ok) onRoom({ id: data.id, name })
    } finally { setLoading(false) }
  }

  return (
    <section id="rooms" className="py-10 px-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-xl font-semibold">Create a room</h3>
        <div className="mt-3 grid gap-3">
          <input className="border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
          <select className="border rounded px-3 py-2" value={type} onChange={e=>setType(e.target.value)}>
            <option value="online">Online</option>
            <option value="in-person">In-person</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <button onClick={create} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-60">{loading ? 'Creating...' : 'Create room'}</button>
        </div>
      </div>
    </section>
  )
}

function NotesTodos({ room, user }) {
  const [title, setTitle] = useState('Kickoff')
  const [scheduledAt, setScheduledAt] = useState(new Date().toISOString())
  const [meeting, setMeeting] = useState(null)

  const createMeeting = async () => {
    const res = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: room.id, title, scheduled_at: scheduledAt, host_user_id: user.userId, participant_user_ids: [] })
    })
    const data = await res.json()
    if (res.ok) setMeeting({ id: data.id, title })
  }

  return (
    <section className="py-10 px-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow border p-6">
        <h3 className="text-xl font-semibold">Meeting, Notes, To-dos</h3>
        {!meeting ? (
          <div className="mt-3 grid gap-3">
            <input className="border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} />
            <input className="border rounded px-3 py-2" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} />
            <button onClick={createMeeting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2">Create meeting</button>
          </div>
        ) : (
          <MeetingWorkspace meeting={meeting} user={user} />
        )}
      </div>
    </section>
  )
}

function MeetingWorkspace({ meeting, user }) {
  const [note, setNote] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])

  const load = async () => {
    const [nRes, tRes] = await Promise.all([
      fetch(`${API_BASE}/api/notes?meeting_id=${meeting.id}`),
      fetch(`${API_BASE}/api/tasks?meeting_id=${meeting.id}`)
    ])
    const [n, t] = await Promise.all([nRes.json(), tRes.json()])
    setNotes(n)
    setTasks(t)
  }

  useEffect(() => { load() }, [meeting.id])

  const addNote = async () => {
    if (!note.trim()) return
    await fetch(`${API_BASE}/api/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meeting_id: meeting.id, author_user_id: user.userId, content: note }) })
    setNote('')
    load()
  }

  const addTask = async () => {
    if (!taskTitle.trim()) return
    await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meeting_id: meeting.id, title: taskTitle, assignee_user_id: user.userId }) })
    setTaskTitle('')
    load()
  }

  const toggleTask = async (t) => {
    const next = t.status === 'done' ? 'open' : 'done'
    await fetch(`${API_BASE}/api/tasks/${t.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
    load()
  }

  const completion = tasks.length ? Math.round((tasks.filter(t=>t.status==='done').length / tasks.length) * 100) : 0

  return (
    <div className="mt-4 grid md:grid-cols-2 gap-6">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold">Notes</h4>
        <div className="mt-2 flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" value={note} onChange={e=>setNote(e.target.value)} placeholder="Type a note and hit add" />
          <button onClick={addNote} className="bg-gray-900 text-white rounded px-3 py-2">Add</button>
        </div>
        <ul className="mt-3 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="text-sm p-2 rounded bg-gray-50 border">{n.content}</li>
          ))}
        </ul>
      </div>
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold">To-dos</h4>
        <div className="mt-2 flex gap-2">
          <input className="border rounded px-3 py-2 flex-1" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="Add a task and assign to yourself" />
          <button onClick={addTask} className="bg-gray-900 text-white rounded px-3 py-2">Add</button>
        </div>
        <ul className="mt-3 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-2 rounded border">
              <span className={t.status==='done' ? 'line-through text-gray-400' : ''}>{t.title}</span>
              <button onClick={()=>toggleTask(t)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">{t.status==='done' ? 'Reopen' : 'Done'}</button>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-gray-600">Completion: {completion}%</div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [room, setRoom] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Hero />
      <div className="max-w-6xl mx-auto">
        {!user && <Signup onSignedUp={setUser} />}
        {user && !workspace && <WorkspaceCreator user={user} onWorkspace={setWorkspace} />}
        {user && workspace && !room && <RoomCreator workspace={workspace} onRoom={setRoom} />}
        {user && workspace && room && <NotesTodos room={room} user={user} />}
      </div>
      <footer className="py-10 text-center text-gray-500">Phase 1: Meetings, Notes, To-dos. Phase 2: AI summaries, whiteboard, analytics.</footer>
    </div>
  )
}

export default App
