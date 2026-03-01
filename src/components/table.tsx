import Item from "@/core/item";
import { Pencil, Trash2, Check } from "lucide-react";

interface TabelaProps {
  item: Item[] | undefined;
  itemSelecionado?: (item: Item) => void;
  itemExcluido?: (item: Item) => void;
  itemToggleChecked?: (item: Item) => void;
}

export default function Table(props: TabelaProps) {
  return (
    <>
      {/* Layout Desktop (Tabela) - oculto em mobile */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-800">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
              <th className="text-left p-4 font-semibold text-indigo-900 dark:text-indigo-200">
                ✓
              </th>
              <th className="text-left p-4 font-semibold text-indigo-900 dark:text-indigo-200">
                Nome
              </th>
              <th className="text-left p-4 font-semibold text-indigo-900 dark:text-indigo-200">
                Observação
              </th>
              <th className="text-center p-4 font-semibold text-indigo-900 dark:text-indigo-200">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {props.item && props.item.length > 0 ? (
              props.item.map((item, i) => (
                <tr
                  key={item.itemId}
                  className={`${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-750"} hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors border-b border-slate-200 dark:border-slate-700 ${
                    item.itemChecked ? "opacity-50" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className="p-4">
                    <button
                      onClick={() => props.itemToggleChecked?.(item)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        item.itemChecked
                          ? "bg-green-500 border-green-500"
                          : "border-slate-400 hover:border-indigo-500"
                      }`}
                    >
                      {item.itemChecked && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </td>

                  {/* Nome */}
                  <td
                    onClick={() => {
                      props.itemSelecionado?.(item);
                    }}
                    className={`text-left p-4 cursor-pointer ${
                      item.itemChecked
                        ? "line-through text-slate-500 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {item.itemNome}
                  </td>

                  {/* Observação */}
                  <td
                    onClick={() => {
                      props.itemSelecionado?.(item);
                    }}
                    className="text-left p-4 cursor-pointer text-slate-600 dark:text-slate-400 text-sm"
                  >
                    {item.itemObservacao || "-"}
                  </td>

                  {/* Ações */}
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      {props.itemSelecionado && (
                        <button
                          onClick={() => props.itemSelecionado?.(item)}
                          className="flex items-center justify-center p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {props.itemExcluido && (
                        <button
                          onClick={() => props.itemExcluido?.(item)}
                          className="flex items-center justify-center p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-slate-500 dark:text-slate-400">
                  Nenhum item adicionado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Layout Mobile (Cards) - visível apenas em mobile */}
      <div className="md:hidden w-full space-y-3">
        {props.item && props.item.length > 0 ? (
          props.item.map((item) => (
            <div
              key={item.itemId}
              className={`border border-slate-300 dark:border-slate-600 rounded-xl p-4 bg-white dark:bg-slate-800 shadow-md ${
                item.itemChecked ? "opacity-50" : ""
              }`}
            >
              {/* Header: Checkbox + Nome */}
              <div className="flex items-start gap-3 mb-3">
                <button
                  onClick={() => props.itemToggleChecked?.(item)}
                  className={`w-8 h-8 min-w-8 rounded-md border-2 flex items-center justify-center transition-all mt-1 ${
                    item.itemChecked
                      ? "bg-green-500 border-green-500"
                      : "border-slate-400 active:border-indigo-500"
                  }`}
                >
                  {item.itemChecked && (
                    <Check className="h-5 w-5 text-white" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() => props.itemSelecionado?.(item)}
                    className={`font-medium text-lg leading-tight ${
                      item.itemChecked
                        ? "line-through text-slate-500 dark:text-slate-500"
                        : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {item.itemNome}
                  </h3>
                  {item.itemObservacao && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">
                      {item.itemObservacao}
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-200 dark:border-slate-600">
                {props.itemSelecionado && (
                  <button
                    onClick={() => props.itemSelecionado?.(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors min-h-11"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="font-medium">Editar</span>
                  </button>
                )}
                {props.itemExcluido && (
                  <button
                    onClick={() => props.itemExcluido?.(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors min-h-11"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Excluir</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
            Nenhum item adicionado ainda
          </div>
        )}
      </div>
    </>
  );
}
