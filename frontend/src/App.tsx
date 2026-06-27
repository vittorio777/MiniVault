import React, { useState, useEffect } from 'react'

const App = () => {
  const [message, setMessage] = useState('loading...')

  useEffect(() => {
    fetch('http://localhost:5158/api/health')
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => {
        console.error(err);
        setMessage('failed to load message');
      });
  },[])

  return (
    <div>{message}</div>
  )
}

export default App