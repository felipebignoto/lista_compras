/* eslint-disable @typescript-eslint/no-explicit-any */
interface ButtonProps {
  text?: string
  color: 'green' | 'blue' | 'red'
  onClick?: () => void
  children?: any
  isIcon?: boolean
  className?: string
}

export default function Button(props: ButtonProps) {
  const isIcon = props.isIcon ?? false
  return (
    <button
      onClick={props.onClick}
      className={`${isIcon ? `text-${props.color}-600 hover:text-white rounded-xl p-1 md:p-2` : `text-white bg-${props.color}-600 p-3 rounded-xl w-fit`} ${props.className}`}
    >
      {props.text}
      {props.children}
    </button>
  )
}
