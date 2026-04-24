type FilterBarProps = {
  weapon: string;
  wear: string;
  weapons: string[];
  wears: string[];
  onWeaponChange: (value: string) => void;
  onWearChange: (value: string) => void;
};

export default function FilterBar({
  weapon,
  wear,
  weapons,
  wears,
  onWeaponChange,
  onWearChange,
}: FilterBarProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label
          htmlFor="weapon-filter"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Weapon
        </label>
        <select
          id="weapon-filter"
          value={weapon}
          onChange={(event) => onWeaponChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-zinc-500 focus:outline-none"
        >
          {weapons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="wear-filter"
          className="mb-2 block text-sm font-medium text-zinc-300"
        >
          Wear
        </label>
        <select
          id="wear-filter"
          value={wear}
          onChange={(event) => onWearChange(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-zinc-500 focus:outline-none"
        >
          {wears.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
