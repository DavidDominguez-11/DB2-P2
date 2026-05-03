import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import Sidebar from './components/layout/Sidebar'
import ToastContainer from './components/common/Toast'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Explorer from './pages/Explorer'
import Nodes from './pages/Nodes'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AppProvider>
      <div className="noise min-h-screen bg-void flex">
        <Sidebar />

        {/* Background ambient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-neon/4 blur-[100px]" />
        </div>

        {/* Main content */}
        <main className="flex-1 ml-16 lg:ml-56 min-h-screen overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/nodes"   element={<Nodes />} />
              <Route path="/admin"   element={<Admin />} />
            </Routes>
          </div>
        </main>

        <ToastContainer />
      </div>
    </AppProvider>
  )
}
