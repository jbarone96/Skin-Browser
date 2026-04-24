import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
import { localeOptions, useLocale } from "../context/LocaleContext";

type LocaleDropdownProps = {
  variant?: "desktop" | "mobile";
};

export default function LocaleDropdown({
  variant = "desktop",
}: LocaleDropdownProps) {
  const { selectedLocale, setSelectedLocale } = useLocale();

  if (variant === "mobile") {
    return (
      <div className="space-y-2">
        {localeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedLocale(option)}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition duration-200 ${
              selectedLocale.value === option.value
                ? "bg-cyan-400/10 text-cyan-300"
                : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`fi fi-${option.flagCode} rounded-sm`} />
              <span>{option.label}</span>
            </span>

            {selectedLocale.value === option.value && <span>✓</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex h-11 min-w-[150px] items-center gap-2 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] px-3 text-sm text-white shadow-inner shadow-white/5 transition duration-200 hover:border-white/20 hover:from-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 data-[state=open]:border-cyan-400/30 data-[state=open]:bg-white/10">
          <span className={`fi fi-${selectedLocale.flagCode} rounded-sm`} />
          <span className="font-medium">{selectedLocale.short}</span>
          <FaChevronDown className="ml-auto text-[10px] text-zinc-400 transition-transform duration-200 data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={10}
          align="end"
          className="
            z-[999]
            w-64
            rounded-2xl
            border
            border-white/10
            bg-[#080d18]/95
            p-2
            shadow-2xl
            shadow-black/50
            outline-none
            backdrop-blur-2xl

            data-[state=open]:animate-[localeDropdownIn_160ms_ease-out]
            data-[state=closed]:animate-[localeDropdownOut_120ms_ease-in]
          "
        >
          {localeOptions.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onClick={() => setSelectedLocale(option)}
              className={`flex cursor-pointer select-none items-center justify-between rounded-xl px-4 py-3 text-sm outline-none transition duration-150 ${
                selectedLocale.value === option.value
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`fi fi-${option.flagCode} rounded-sm`} />
                <span>{option.label}</span>
              </span>

              {selectedLocale.value === option.value && (
                <span className="text-cyan-300">✓</span>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
