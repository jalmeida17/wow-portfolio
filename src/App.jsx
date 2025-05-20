import { useState } from 'react'
import ThreeJSEnv from './components/threejs-env/threejs-env'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ThreeJSEnv/>
    </>
  )
}

export default App
