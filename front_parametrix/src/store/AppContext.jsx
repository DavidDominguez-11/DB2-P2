import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

// Default user for display — replaced when backend auth is implemented
const DEFAULT_USER = {
  user_id: 'u1',
  username: 'nova_kai',
  email: 'nova@parametrix.app',
  premium: true,
  generos_favoritos: ['Electronic', 'Dream Pop'],
}

export function AppProvider({ children }) {
  const [user]   = useState(DEFAULT_USER)
  const [toasts, setToasts] = useState([])
  const [graphFilters, setGraphFilters] = useState({
    showFollows: true, showListened: true, showBy: true,
    showBelongsTo: true, showIncludes: true,
  })

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <AppContext.Provider value={{ user, toasts, addToast, graphFilters, setGraphFilters }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
