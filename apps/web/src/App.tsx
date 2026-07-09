import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>code-adventure</h1>
      <p>API connectivity: {status}</p>
    </main>
  )
}

export default App
