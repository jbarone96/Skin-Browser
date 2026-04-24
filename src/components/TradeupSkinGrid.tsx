import type { TradeupSkin } from "../types/tradeup";
import TradeupSkinCard from "./TradeupSkinCard";

interface TradeupSkinGridProps {
  skins: TradeupSkin[];
  selectedCount: number;
  onAddSkin: (skin: TradeupSkin) => void;
}

export default function TradeupSkinGrid({
  skins,
  selectedCount,
  onAddSkin,
}: TradeupSkinGridProps) {
  const isFull = selectedCount >= 10;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {skins.map((skin) => (
        <TradeupSkinCard
          key={skin.id}
          skin={skin}
          isDisabled={isFull}
          onAdd={onAddSkin}
        />
      ))}
    </div>
  );
}
