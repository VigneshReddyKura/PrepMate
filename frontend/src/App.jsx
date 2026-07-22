import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedResume, setParsedResume] = useState(null)

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

  const handleResumeUpload = async () => {
  if (!selectedFile) {
    setMessage('Please choose a file first')
    return
  }

  const token = localStorage.getItem('access_token')
  const formData = new FormData()
  formData.append('file', selectedFile)

  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      setMessage(`Parsing resume... (attempt ${attempt}/${maxRetries})`)
      const response = await fetch('http://localhost:8000/parse-resume', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.status === 401) {
        setMessage('Session expired. Please log out and log in again.')
        return
      }

      const data = await response.json()

      if (data.success) {
        setMessage('Resume parsed and saved!')
        setParsedResume(data.parsed_data)
        return
      }

      const isOverloaded = data.error && data.error.includes('503')
      if (isOverloaded && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        continue
      }

      setMessage('Failed: ' + data.error)
      return
    } catch (err) {
      setMessage('Could not reach backend')
      return
    }
  }
}

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>PrepMate</h1>

      {isLoggedIn ? (
        <div>
          <p>You're logged in!</p>
          <button onClick={handleLogout}>Log Out</button>

          <div style={{ marginTop: '2rem' }}>
            <h2>Upload Resume</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button onClick={handleResumeUpload} style={{ marginLeft: '1rem' }}>
              Upload & Parse
            </button>
          </div>

          {parsedResume && (
            <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
              <h3>Parsed Resume Data</h3>
              <p><strong>Name:</strong> {parsedResume.name}</p>
              <p><strong>Skills:</strong> {parsedResume.skills.join(', ')}</p>
              <h4>Projects</h4>
              <ul>
                {parsedResume.projects.map((proj, index) => (
                  <li key={index}>
                    <strong>{proj.title}</strong>: {proj.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
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