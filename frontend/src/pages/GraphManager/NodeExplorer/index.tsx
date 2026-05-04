import { useState } from 'react'
import SingleNodePanel from './SingleNodePanel'
import NodeListPanel from './NodeListPanel'
import AggregationPanel from './AggregationPanel'

const TABS = ['single', 'list', 'aggregate'] as const
type Tab = (typeof TABS)[number]
const LABELS: Record<Tab, string> = { single: 'Nodo Individual', list: 'Múltiples Nodos', aggregate: 'Agregaciones' }

export default function NodeExplorer() {
  const [tab, setTab] = useState<Tab>('single')

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#111118] border border-[#252535] rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === t ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}>
            {LABELS[t]}
          </button>
        ))}
      </div>
      {tab === 'single' && <SingleNodePanel />}
      {tab === 'list' && <NodeListPanel />}
      {tab === 'aggregate' && <AggregationPanel />}
    </div>
  )
}
