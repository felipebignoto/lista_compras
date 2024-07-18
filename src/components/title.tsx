import { ShoppingBasket } from 'lucide-react'

interface TitleProps {
  title: string
  subtitle?: string
}

export default function Title(props: TitleProps) {
  return (
    <div className="p-4 border border-black mt-4 flex flex-col justify-center items-center gap-2">
      <ShoppingBasket className="h-9 w-9" />
      <h1 className="text-3xl underline ">{props.title}</h1>
      {props.subtitle ? <h2 className="text-xl">{props.subtitle}</h2> : false}
    </div>
  )
}
