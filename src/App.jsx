import { useState } from 'react'
import MainScreen from './components/MainScreen'
import CategorySettings from './components/CategorySettings'
import './App.css'

function App() {
  const [currentScreen, setCurrentScreen] = useState('main')

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainScreen onNavigate={setCurrentScreen} />
      case 'settings':
        return <CategorySettings onNavigate={setCurrentScreen} />
      default:
        return <MainScreen onNavigate={setCurrentScreen} />
    }
  }

  return (
    <div className="app">
      {renderScreen()}
    </div>
  )
}

export default App
