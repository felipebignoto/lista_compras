interface InputProps {
  type: string;
  value: string | number;
  onChange: (value: string) => void;
}

export default function Input(props: InputProps) {
  return (
    <input
      className="bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 w-full sm:min-w-96 p-3 md:p-3 min-h-11 rounded-lg transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
      type={props.type}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  );
}
