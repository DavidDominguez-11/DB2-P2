import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import NodeCard from '../../components/graph/NodeCard'
import { useUser } from '../../hooks/useUsers'
import { useUserActivity } from '../../hooks/useAnalytics'
import EditProfileModal from './EditProfileModal'

export default function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const effectiveId = userId === 'me' ? '' : (userId ?? '')

  const { data: user, isLoading: loadingUser } = useUser(effectiveId)
  const { data: activity } = useUserActivity(effectiveId)

  if (userId === 'me') {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Mi Perfil" />
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-6 text-center">
          <p className="text-[#8888AA] mb-4">Ingresa un ID de usuario para ver el perfil</p>
          <form onSubmit={(e) => { e.preventDefault(); const f = e.target as HTMLFormElement; const id = (f.elements.namedItem('uid') as HTMLInputElement).value; if (id) navigate(`/profile/${id}`) }}>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input name="uid" placeholder="ID de usuario" className="flex-1 bg-[#090910] border border-[#252535] rounded-lg px-3 py-2 text-sm text-[#F0F0FF] placeholder-[#44445A] focus:outline-none focus:border-[#7C6FFF]" />
              <button type="submit" className="px-4 py-2 bg-[#7C6FFF] text-white rounded-lg text-sm">Ver</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loadingUser) return <LoadingSpinner className="py-12" />

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <PageHeader
        title="Perfil de Usuario"
        subtitle={`ID: ${userId}`}
        action={
          <button onClick={() => setEditOpen(true)} className="px-4 py-2 text-sm border border-[#252535] rounded-lg text-[#8888AA] hover:text-[#F0F0FF] transition-colors">
            Editar
          </button>
        }
      />

      {user ? (
        <>
          <NodeCard node={{ labels: user.labels ?? ['User'], properties: user.properties ?? user }} />

          {activity && (
            <div className="bg-[#16161F] border border-[#252535] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#F0F0FF] mb-3 font-display">Actividad</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(activity).filter(([k]) => !['user_id', 'username'].includes(k)).map(([k, v]) => (
                  <div key={k} className="bg-[#090910] rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-[#7C6FFF]">{String(v)}</p>
                    <p className="text-xs text-[#8888AA] capitalize">{k.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#16161F] border border-[#252535] rounded-xl p-6 text-center text-[#8888AA]">
          Usuario no encontrado
        </div>
      )}

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} userId={userId ?? ''} />
    </div>
  )
}
