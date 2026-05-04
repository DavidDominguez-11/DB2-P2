import { useState } from 'react'
import SinglePropertyOps from './SinglePropertyOps'
import BulkPropertyOps from './BulkPropertyOps'

export default function PropertyManager() {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')

  return (
    <div>
      <div className="flex gap-1 mb-5 bg-[#111118] border border-[#252535] rounded-lg p-1 w-fit">
        <button onClick={() => setTab('single')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'single' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}>Individual</button>
        <button onClick={() => setTab('bulk')} className={`px-4 py-1.5 rounded-md text-sm transition-colors ${tab === 'bulk' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'}`}>Masivo</button>
      </div>
      {tab === 'single' ? <SinglePropertyOps /> : <BulkPropertyOps />}
    </div>
  )
}
