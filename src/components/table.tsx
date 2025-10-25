import Item from '@/core/item'
import { Pencil, Trash2, Check } from 'lucide-react'
import Button from './button'

interface TabelaProps {
  item: Item[] | undefined
  itemSelecionado?: (item: Item) => void
  itemExcluido?: (item: Item) => void
  itemToggleChecked?: (item: Item) => void
}

export default function Table(props: TabelaProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border border-slate-300 rounded-xl overflow-hidden shadow-lg bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
            <th className="text-left p-4 font-semibold text-indigo-900">✓</th>
            <th className="text-left p-4 font-semibold text-indigo-900">Nome</th>
            <th className="text-center p-4 font-semibold text-indigo-900">Qtd</th>
            <th className="text-left p-4 font-semibold text-indigo-900">Observação</th>
            <th className="text-center p-4 font-semibold text-indigo-900">Ações</th>
          </tr>
        </thead>
        <tbody>
          {props.item && props.item.length > 0 ? (
            props.item.map((item, i) => (
              <tr
                key={item.itemId}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-indigo-50 transition-colors border-b border-slate-200 ${
                  item.itemChecked ? 'opacity-50' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="p-4">
                  <button
                    onClick={() => props.itemToggleChecked?.(item)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.itemChecked
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-400 hover:border-indigo-500'
                    }`}
                  >
                    {item.itemChecked && <Check className="h-4 w-4 text-white" />}
                  </button>
                </td>

                {/* Nome */}
                <td
                  onClick={() => {
                    props.itemSelecionado?.(item)
                  }}
                  className={`text-left p-4 cursor-pointer ${
                    item.itemChecked ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {item.itemNome}
                </td>

                {/* Quantidade */}
                <td
                  onClick={() => {
                    props.itemSelecionado?.(item)
                  }}
                  className="text-center p-4 cursor-pointer text-slate-700"
                >
                  {item.itemQuantidade}
                </td>

                {/* Observação */}
                <td
                  onClick={() => {
                    props.itemSelecionado?.(item)
                  }}
                  className="text-left p-4 cursor-pointer text-slate-600 text-sm"
                >
                  {item.itemObservacao || '-'}
                </td>

                {/* Ações */}
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    {props.itemSelecionado && (
                      <Button
                        className="hover:bg-indigo-600 bg-indigo-500"
                        color="blue"
                        isIcon
                        onClick={() => {
                          props.itemSelecionado?.(item)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {props.itemExcluido && (
                      <Button
                        className="hover:bg-red-600 bg-red-500"
                        color="red"
                        isIcon
                        onClick={() => props.itemExcluido?.(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-8 text-slate-500">
                Nenhum item adicionado ainda
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
