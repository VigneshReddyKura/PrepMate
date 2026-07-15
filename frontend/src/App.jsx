import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage('Signup successful! You can now log in.')
      } else {
        setMessage('Signup failed: ' + data.error)
      }
    } catch (err) {
      setMessage('Could not reach backend')
    }
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('access_token', data.access_token)
        setMessage('Login successful!')
        setIsLoggedIn(true)
      } else {
        setMessage('Login failed: ' + data.error)
      }
    } catch (err) {
      setMessage('Could not reach backend')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setIsLoggedIn(false)
    setMessage('Logged out.')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>PrepMate</h1>

      {isLoggedIn ? (
        <div>
          <p>You're logged in!</p>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={handleLogin} style={{ marginLeft: '1rem' }}>
            Log In
          </button>
        </>
      )}

      <p>{message}</p>
    </div>
  )
}

export default App