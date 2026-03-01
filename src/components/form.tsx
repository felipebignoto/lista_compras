import Item from "@/core/item";
import Button from "./button";
import Input from "./input";
import Title from "./title";
import { useState } from "react";

interface FormProps {
  item: Item;
  title: string;
  textButton: string;
  itemChanged?: (item: Item) => void;
  canceled?: () => void;
}

export default function Form(props: FormProps) {
  const [nome, setNome] = useState(props.item.itemNome ?? "");
  const [observacao, setobservacao] = useState(props.item.itemObservacao ?? "");
  const id = props.item?.itemId;
  return (
    <div className="w-full max-w-2xl p-4 md:p-6 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl shadow-xl">
      <Title title={props.title}></Title>
      <div className="flex flex-col gap-4 md:gap-5 mt-4 md:mt-6">
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base">
            Nome
          </label>
          <Input onChange={setNome} value={nome} type="text"></Input>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 dark:text-slate-300 font-medium text-sm md:text-base">
            Observação
          </label>
          <Input
            onChange={setobservacao}
            value={observacao}
            type="text"
          ></Input>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end mt-4 md:mt-6 gap-2 md:gap-3">
        <Button
          onClick={props.canceled}
          color="red"
          text="Cancelar"
          className="w-full sm:w-auto bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 min-h-11"
        />
        <Button
          onClick={() => props.itemChanged?.(new Item(nome, observacao, id))}
          color="green"
          text={props.textButton}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg min-h-11"
        />
      </div>
    </div>
  );
}
