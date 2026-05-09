import ManualSearch from './components/ManualSearch'

export default function App() {
  return (
    <div className="min-h-screen bg-teal-500">
      <header className="bg-slate-800 text-white px-6 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <img
              src="/smart-assign-logo.png"
              alt="SmartAssign"
              className="h-12 w-12 rounded-lg"
            />
            <h1 className="text-xl font-bold">SmartAssign</h1>
          </div>
          <button aria-label="Open chat" className="opacity-80 hover:opacity-100 transition-opacity">
            <img src="/chat-icon.png" alt="Chat" className="h-12 w-12" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <ManualSearch />
      </div>
    </div>
  )
}
