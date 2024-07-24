import Item from '@/core/item'
import { Pencil, Trash2 } from 'lucide-react'
import Button from './button'

interface TabelaProps {
  item: Item[] | undefined
  itemSelecionado?: (item: Item) => void
  itemExcluido?: (item: Item) => void
}

export default function Table(props: TabelaProps) {
  return (
    <table className="w-64 md:w-fit border-2 border-black overflow-hidden rounded-lg bg-white m-1 ">
      <thead className="">
        <tr className="bg-gray-300">
          <th className="text-center p-1 md:p-4">Nome</th>
          <th className="text-center p-1 md:p-4">quant.</th>
          <th className="text-center p-1 md:p-4">Aviso</th>
          <th className="text-center p-1 md:p-4">Ações</th>
        </tr>
      </thead>
      <tbody>
        {props.item?.map((item, i) => (
          <tr
            key={item.itemId}
            className={`${i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'} w-full `}
          >
            <td
              onClick={() => {
                props.itemSelecionado?.(item)
              }}
              className="text-left py-1 md:py-2 md:px-4 whitespace-normal"
            >
              {item.itemNome}
            </td>

            <td
              onClick={() => {
                props.itemSelecionado?.(item)
              }}
              className="text-center py-1 md:py-2 md:px-4"
            >
              {item.itemQuantidade}
            </td>
            <td
              onClick={() => {
                props.itemSelecionado?.(item)
              }}
              className="h-min text-left py-1 md:py-2 md:px-4 whitespace-normal "
            >
              {item.itemObservacao}
            </td>
            <td className="md:gap-2 py-1 md:py-2 md:px-4">
              <div className="flex">
                <Button
                  className="hover:bg-blue-600"
                  color="blue"
                  isIcon
                  onClick={() => {
                    props.itemSelecionado?.(item)
                  }}
                >
                  <Pencil className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
                <Button
                  className="hover:bg-red-600 z-10"
                  color="red"
                  isIcon
                  onClick={() => props.itemExcluido?.(item)}
                >
                  <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
