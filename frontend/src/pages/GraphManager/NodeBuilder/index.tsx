import { useState } from 'react'
import SingleLabelForm from './SingleLabelForm'
import MultiLabelForm from './MultiLabelForm'

export default function NodeBuilder() {
  const [mode, setMode] = useState<'single' | 'multi'>('single')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-[#8888AA]">Modo:</span>
        <div className="flex bg-[#111118] border border-[#252535] rounded-lg p-0.5">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              mode === 'single' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'
            }`}
          >
            Single Label
          </button>
          <button
            onClick={() => setMode('multi')}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              mode === 'multi' ? 'bg-[#7C6FFF] text-white' : 'text-[#8888AA] hover:text-[#F0F0FF]'
            }`}
          >
            Multi-Label
          </button>
        </div>
      </div>

      {mode === 'single' ? <SingleLabelForm /> : <MultiLabelForm />}
    </div>
  )
}
