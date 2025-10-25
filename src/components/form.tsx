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
  const [quantidade, setquantidade] = useState(props.item.itemQuantidade ?? 1);
  const [observacao, setobservacao] = useState(props.item.itemObservacao ?? "");
  const id = props.item?.itemId;
  return (
    <div className="w-full max-w-2xl p-6 bg-slate-50 border border-slate-300 rounded-2xl shadow-xl">
      <Title title={props.title}></Title>
      <div className="flex flex-col gap-5 mt-6">
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 font-medium text-sm">Nome</label>
          <Input onChange={setNome} value={nome} type="text"></Input>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 font-medium text-sm">
            Quantidade
          </label>
          <Input
            onChange={(value) => setquantidade(Number(value))}
            value={quantidade}
            type="number"
          ></Input>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-slate-700 font-medium text-sm">
            Observação
          </label>
          <Input
            onChange={setobservacao}
            value={observacao}
            type="text"
          ></Input>
        </div>
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <Button
          onClick={props.canceled}
          color="red"
          text="Cancelar"
          className="bg-red-100 hover:bg-red-200 border border-red-300 text-red-700"
        />
        <Button
          onClick={() =>
            props.itemChanged?.(new Item(nome, +quantidade, observacao, id))
          }
          color="green"
          text={props.textButton}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
        />
      </div>
    </div>
  );
}
