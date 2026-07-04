import React, { useState } from 'react'

const Login = () => {
  const [nickname, setNickname] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleLogin() {

    const response = await fetch("http://localhost:5158/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        password,
      }),
    });

    const data = await response.json();
    console.log(data);
  }

  async function handleRegister() {
    const response = await fetch("http://localhost:5158/api/users/register", {
      method: "POST",
      headers: {
        "content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname,
        password,
      }),
    });

    const data = await response.json();
    console.log(data);
  }


  return (
    <div>
        <div>
          <label>昵称</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder='name'/>
        </div>
          
        <div>
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password'/>
        </div>

        <button onClick={handleLogin}>login</button>

        <button onClick={handleRegister}>Register</button>
    </div>
  )
}

export default Login
