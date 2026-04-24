import type { Skin } from "../types/skin";
import SkinCard from "./SkinCard";

type SkinGridProps = {
  skins: Skin[];
};

export default function SkinGrid({ skins }: SkinGridProps) {
  if (skins.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center">
        <p className="text-sm text-zinc-400">No skins found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {skins.map((skin) => (
        <SkinCard key={skin.id} skin={skin} />
      ))}
    </div>
  );
}
