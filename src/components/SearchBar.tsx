type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full">
      <label
        htmlFor="skin-search"
        className="mb-2 block text-sm font-medium text-zinc-300"
      >
        Search
      </label>
      <input
        id="skin-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by skin or weapon..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
    </div>
  );
}
