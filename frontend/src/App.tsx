import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './config/queryClient'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import Playlists from './pages/Playlists'
import Analytics from './pages/Analytics'
import GraphManager from './pages/GraphManager'
import NodeBuilder from './pages/GraphManager/NodeBuilder'
import NodeExplorer from './pages/GraphManager/NodeExplorer'
import PropertyManager from './pages/GraphManager/PropertyManager'
import RelationshipBuilder from './pages/GraphManager/RelationshipBuilder'
import RelationshipManager from './pages/GraphManager/RelationshipManager'
import DeletePanel from './pages/GraphManager/DeletePanel'
import CypherConsole from './pages/GraphManager/CypherConsole'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="profile/:userId" element={<Profile />} />
            <Route path="explore" element={<Explore />} />
            <Route path="playlists" element={<Playlists />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="graph-manager" element={<GraphManager />}>
              <Route path="node-builder" element={<NodeBuilder />} />
              <Route path="node-explorer" element={<NodeExplorer />} />
              <Route path="property-manager" element={<PropertyManager />} />
              <Route path="relationship-builder" element={<RelationshipBuilder />} />
              <Route path="relationship-manager" element={<RelationshipManager />} />
              <Route path="delete-panel" element={<DeletePanel />} />
              <Route path="cypher-console" element={<CypherConsole />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#16161F',
            border: '1px solid #252535',
            color: '#F0F0FF',
          },
        }}
      />
    </QueryClientProvider>
  )
}
