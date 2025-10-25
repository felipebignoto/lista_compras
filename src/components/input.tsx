/* eslint-disable @typescript-eslint/no-explicit-any */
interface InputProps {
  type: string
  value: any
  onChange: (value: any) => void
}

export default function Input(props: InputProps) {
  return (
    <input
      className="bg-white border-2 border-slate-300 text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:min-w-96 p-3 rounded-lg transition-all placeholder:text-slate-400"
      type={props.type}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  )
}
