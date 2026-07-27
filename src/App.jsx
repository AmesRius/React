import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import Timer from './components/Timer'

function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <Timer />
    </div>
  )
}

export default App