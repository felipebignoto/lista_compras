import { ShoppingBasket } from "lucide-react";

interface TitleProps {
  title: string;
  subtitle?: string;
  TextButton?: string;
  icon?: boolean;
}

export default function Title(props: TitleProps) {
  return (
    <div className="p-4  rounded-lg text-center  flex flex-col justify-center items-center gap-2">
      {props.icon ? <ShoppingBasket className="h-9 w-9" /> : false}
      <h1 className="text-3xl underline ">{props.title}</h1>
      {props.subtitle ? <h2 className="text-xl">{props.subtitle}</h2> : false}
    </div>
  );
}
