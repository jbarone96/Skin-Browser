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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
