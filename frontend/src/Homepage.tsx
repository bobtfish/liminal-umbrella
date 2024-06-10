import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { LogoutButton, doAuthRedirect, isAuthenticated } from './Auth';
import './App.css'


function AuthData(props: {auth: any}) {
  if (!props.auth || !props.auth.data) {
    return <div>NO AUTH DATA</div>
  }
  return <div>
  LOADING: {props.auth.isFetching ? 'true' : 'false'}<br />
  Network Error: {props.auth.isError}<br />
  Auth Error: {props.auth.data.error}<br />
  DATA: {JSON.stringify(props.auth.data)}<br />
  </div>
}

function HomePage(props: {auth: any} = {auth: null}) {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuthData auth={props.auth} />
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">


        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {!isAuthenticated(props.auth) ?
          <button onClick={doAuthRedirect}>
            Login
          </button>
          : <></>
        }
        <LogoutButton auth={props.auth} />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default HomePage
