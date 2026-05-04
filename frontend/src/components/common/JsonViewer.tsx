interface Props { data: unknown; maxHeight?: string }

export default function JsonViewer({ data, maxHeight = '300px' }: Props) {
  return (
    <pre
      className="bg-[#090910] border border-[#252535] rounded-lg p-4 text-xs text-[#00E5CC] font-mono overflow-auto"
      style={{ maxHeight }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
