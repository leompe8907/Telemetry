import React, { useState } from 'react'
import md5 from "md5"
import {CV} from "../../cv/cv"
import Logo from "../../Media/Img/logoB.png"
import {useNavigate } from 'react-router-dom'
import "./Login.scss"


function Login() {
  const cvToken = "AsGHqHpHYZiacNsAWiyS";
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const navigate = useNavigate()

  function loginFailed(reason) {
    console.log(reason);
  }

  function loggedIn(reason) {
    console.log(reason);
  }
  
  const onWindLoad = () => {
    CV.init({
      baseUrl : "https://pmdw-1.in.tv.br",
      mode:"json",
      username:username,
      password:password,
      apiToken:cvToken,
      loginSuccessCallback: loggedIn,
      loginFailedCallback: loginFailed
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordHash = md5(password+"_panaccess");
    CV.call(
      "login",
      {
        username: username,
        password: passwordHash,
        apiToken:cvToken
      },
      (result) => {
        if (result["success"]){
          const sessionID = result["answer"]
          localStorage.setItem("sessionID", sessionID)
          localStorage.setItem("cvUser",username)
          localStorage.setItem("cvPass",password)
          localStorage.setItem("cvToken",cvToken)
          onWindLoad()
          navigate('/telemetria')
        }else{
            alert("failed to fetch result"+result["errorMessage"])
        }
      }
    )
  }

  return (
    <>
      <div className="Background">
        <div className="Login">
          <div className="logo">
            <img src={Logo} alt="Logo" className="Logo" /> 
          </div>
          <form onSubmit={handleSubmit} className="formLogin">
            <div className="" >
              <input
                type="text"
                id="username"
                className="user"
                autoComplete="off"
                value={username}
                placeholder="Usuario..."
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="" >
              <input
                type="password"
                id="password"
                className="user"
                autoComplete="off"
                value={password}
                placeholder="Password..."
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="button"> Sign In </button>
          </form>
        </div>
      </div>
    </>
  );
}
export default Login