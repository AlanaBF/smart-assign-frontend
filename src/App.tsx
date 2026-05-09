import { Routes, Route, Link } from 'react-router-dom'
import ManualSearch from './components/ManualSearch'

export default function App() {
  return (
    <div className="min-h-screen bg-teal-500">
      <header className="bg-slate-800 text-white px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <img
                src="/smart-assign-logo.png"
                alt="SmartAssign"
                className="h-12 w-12 rounded-lg"
              />
              <h1 className="text-xl font-bold">SmartAssign</h1>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:text-teal-300 transition-colors">Search</Link>
            <Link to="/chat" className="opacity-80 hover:opacity-100 transition-opacity">
              <img src="/chat-icon.png" alt="Chat" className="h-12 w-12" />
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <Routes>
          <Route path="/" element={<ManualSearch />} />
          <Route path="/chat" element={<ComingSoon />} />
        </Routes>
      </div>
    </div>
  )
}

function ComingSoon() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h2>
      <p className="text-gray-500">Coming soon — CV rewriter powered by AI.</p>
    </div>
  )
}
