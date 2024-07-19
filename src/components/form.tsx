import Item from '@/core/item'
import Button from './button'
import Input from './input'
import Title from './title'
import { useState } from 'react'

interface FormProps {
  item: Item
  title: string
  textButton: string
  itemChanged?: (item: Item) => void
  canceled?: () => void
}

export default function Form(props: FormProps) {
  const [nome, setNome] = useState(props.item.itemNome ?? '')
  const [quantidade, setquantidade] = useState(props.item.itemQuantidade ?? 1)
  const [observacao, setobservacao] = useState(props.item.itemObservacao ?? '')
  const id = props.item?.itemId
  return (
    <div className=" p-4 bg-gray-100 border-2 border-black">
      <Title title={props.title}></Title>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label>Nome: </label>
          <Input onChange={setNome} value={nome} type="text"></Input>
        </div>
        <div className="flex flex-col gap-2">
          <label>Quantidade: </label>
          <Input
            onChange={setquantidade}
            value={quantidade}
            type="number"
          ></Input>
        </div>
        <div className="flex flex-col gap-2">
          <label>Observação: </label>
          <Input
            onChange={setobservacao}
            value={observacao}
            type="text"
          ></Input>
        </div>
      </div>

      <div className="flex justify-end mt-2 gap-2">
        <Button onClick={props.canceled} color="red" text="Cancelar" />
        <Button
          onClick={() =>
            props.itemChanged?.(new Item(nome, +quantidade, observacao, id))
          }
          color="green"
          text={props.textButton}
        />
      </div>
    </div>
  )
}
