import React from 'react'
import DealCalculator from './components/DealCalculator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            DealCalc
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Professional affiliate marketing deal calculator with real-time margin calculations and bidirectional input support
          </p>
        </header>
        
        <DealCalculator />
        
        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>© 2024 DealCalc. Built for affiliate marketing professionals.</p>
        </footer>
      </div>
    </div>
  )
}

export default App 