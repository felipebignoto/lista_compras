/* eslint-disable @typescript-eslint/no-explicit-any */
interface InputProps {
  type: string
  value: any
  onChange: (value: any) => void
}

export default function Input(props: InputProps) {
  return (
    <input
      className="bg-gray-200 outline-none focus:bg-gray-300  sm:min-w-96 p-2"
      type={props.type}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  )
}
