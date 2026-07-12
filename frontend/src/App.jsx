import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Could not reach backend'))
  }, [])

  return (
    <div>
      <h1>PrepMate</h1>
      <p>Backend says: {message}</p>
    </div>
  )
}

export default App