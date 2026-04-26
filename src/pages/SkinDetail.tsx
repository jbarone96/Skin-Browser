import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { useSkin } from "../hooks/useSkin";
import { db } from "../utils/firebase";

type CollectionLogoMap = Record<string, string>;

type PricePoint = {
  label: string;
  value: number;
};

const mockPriceHistory: PricePoint[] = [
  { label: "Jan", value: 8.15 },
  { label: "Feb", value: 8.42 },
  { label: "Mar", value: 7.96 },
  { label: "Apr", value: 9.1 },
  { label: "May", value: 10.25 },
  { label: "Jun", value: 9.74 },
  { label: "Jul", value: 11.35 },
];

function normalizeCollectionName(value: string) {
  return value.trim().toLowerCase();
}

function formatFloatRangeCompact(
  minFloat: number | null,
  maxFloat: number | null,
) {
  if (minFloat === null || maxFloat === null) return "N/A";

  const format = (value: number) => value.toFixed(2);

  return `${format(minFloat)} - ${format(maxFloat)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function SkinDetail() {
  const { id } = useParams<{ id: string }>();
  const { skin, loading, error } = useSkin(id);

  const [collectionLogos, setCollectionLogos] = useState<CollectionLogoMap>({});

  useEffect(() => {
    let isMounted = true;

    async function fetchCollections() {
      try {
        const snapshot = await getDocs(collection(db, "collections"));

        const nextMap: CollectionLogoMap = {};

        snapshot.forEach((doc) => {
          const data = doc.data() as { name?: string; image?: string };

          if (data.name && data.image) {
            nextMap[normalizeCollectionName(data.name)] = data.image;
          }
        });

        if (isMounted) {
          setCollectionLogos(nextMap);
        }
      } catch (err) {
        console.error("[SkinDetail] Failed to load collection logos:", err);
      }
    }

    fetchCollections();

    return () => {
      isMounted = false;
    };
  }, []);

  const wears = (
    (skin?.wears ?? []) as Array<string | { id?: string; name: string }>
  ).map((wear) => (typeof wear === "string" ? wear : wear.name));

  const collectionName = useMemo(() => {
    return skin?.collection ?? skin?.collections?.[0]?.name ?? null;
  }, [skin]);

  const collectionLogo = collectionName
    ? collectionLogos[normalizeCollectionName(collectionName)]
    : null;

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >
          ← Back to Skins
        </Link>

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center text-white/75 backdrop-blur-xl">
            Loading skin...
          </div>
        ) : error || !skin ? (
          <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 px-6 py-16 text-center text-red-100 backdrop-blur-xl">
            {error ?? "Skin not found."}
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-6 rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:p-8">
              <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8">
                <img
                  src={skin.image}
                  alt={skin.fullName}
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
                    {skin.weaponType}
                  </p>

                  <div className="mt-2 flex items-start gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {skin.fullName}
                    </h1>

                    {skin.rarityColor ? (
                      <span
                        className="mt-3 h-4 w-4 shrink-0 rounded-full border border-white/20"
                        style={{ backgroundColor: skin.rarityColor }}
                        aria-label={skin.rarity ?? "Rarity color"}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailCard label="Weapon" value={skin.weapon} />
                  <DetailCard label="Rarity" value={skin.rarity ?? "N/A"} />

                  <CollectionDetailCard
                    collectionName={collectionName ?? "N/A"}
                    collectionLogo={collectionLogo}
                  />

                  <DetailCard
                    label="Float Range"
                    value={formatFloatRangeCompact(
                      skin.minFloat,
                      skin.maxFloat,
                    )}
                  />

                  <DetailCard
                    label="StatTrak"
                    value={skin.statTrak ? "Yes" : "No"}
                  />
                  <DetailCard
                    label="Souvenir"
                    value={skin.souvenir ? "Yes" : "No"}
                  />
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    Available Wears
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {wears.length > 0 ? (
                      wears.map((wear) => (
                        <span
                          key={wear}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/85"
                        >
                          {wear}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-medium text-white/65">
                        N/A
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <PriceHistoryPanel skinName={skin.fullName} />
          </div>
        )}
      </div>
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function CollectionDetailCard({
  collectionName,
  collectionLogo,
}: {
  collectionName: string;
  collectionLogo: string | null;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
        Collection
      </p>

      <div className="mt-2 flex items-center gap-3">
        {collectionLogo ? (
          <img
            src={collectionLogo}
            alt={collectionName}
            className="h-8 w-8 shrink-0 rounded-md object-contain"
            loading="lazy"
          />
        ) : null}

        <p className="text-base font-semibold text-white">{collectionName}</p>
      </div>
    </div>
  );
}

function PriceHistoryPanel({ skinName }: { skinName: string }) {
  const [selectedWindow, setSelectedWindow] = useState("3M");

  const values = mockPriceHistory.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const current = values[values.length - 1];
  const previous = values[values.length - 2] ?? current;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const change = current - previous;
  const changePercent = previous === 0 ? 0 : (change / previous) * 100;
  const isUp = change >= 0;

  const timeWindows = ["1D", "7D", "1M", "3M", "6M", "1Y", "ALL"];

  const paddingX = 8;
  const paddingY = 10;

  const chartPoints = mockPriceHistory.map((point, index) => {
    const x =
      paddingX + (index / (mockPriceHistory.length - 1)) * (100 - paddingX * 2);

    const y =
      paddingY +
      (1 - (point.value - min) / (max - min || 1)) * (100 - paddingY * 2);

    return { ...point, x, y };
  });

  const linePoints = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const areaPoints = [
    `${chartPoints[0].x},100`,
    ...chartPoints.map((point) => `${point.x},${point.y}`),
    `${chartPoints[chartPoints.length - 1].x},100`,
  ].join(" ");

  const yAxisPrices = [max, (max + min) / 2, min];

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-8">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
            Market Data
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Price History
          </h2>

          <p className="mt-2 text-sm text-white/45">
            Preview pricing trend for {skinName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MarketStat label="Current" value={formatCurrency(current)} />
          <MarketStat label="Average" value={formatCurrency(average)} />
          <MarketStat label="Low" value={formatCurrency(min)} />
          <MarketStat label="High" value={formatCurrency(max)} />
          <MarketStat
            label="Change"
            value={`${isUp ? "+" : ""}${changePercent.toFixed(2)}%`}
            positive={isUp}
          />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-zinc-950/55 p-5">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-white">
              {formatCurrency(current)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                isUp ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {isUp ? "+" : ""}
              {formatCurrency(change)} · {isUp ? "+" : ""}
              {changePercent.toFixed(2)}%
            </p>
          </div>

          <div className="flex w-full overflow-x-auto rounded-full border border-white/10 bg-white/[0.04] p-1 lg:w-auto">
            {timeWindows.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedWindow(range)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  range === selectedWindow
                    ? "bg-cyan-300 text-zinc-950 shadow-[0_0_18px_rgba(103,232,249,0.22)]"
                    : "text-white/45 hover:bg-white/8 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-3">
          <div className="relative h-[290px] overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_45%)]" />

            {[25, 50, 75].map((top) => (
              <div
                key={top}
                className="absolute left-5 right-5 border-t border-white/[0.06]"
                style={{ top: `${top}%` }}
              />
            ))}

            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="relative z-10 h-full w-full"
              aria-label="Price history chart"
            >
              <defs>
                <linearGradient id="skinPriceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                </linearGradient>
              </defs>

              <polygon points={areaPoints} fill="url(#skinPriceFill)" />

              <polyline
                points={linePoints}
                fill="none"
                stroke="rgb(34,211,238)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="flex h-[290px] flex-col justify-between py-1 text-right text-xs font-semibold text-white/35">
            {yAxisPrices.map((price) => (
              <span key={price}>{formatCurrency(price)}</span>
            ))}
          </div>
        </div>

        <div className="mt-3 mr-[84px] grid grid-cols-7 text-center text-xs font-semibold text-white/30">
          {mockPriceHistory.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketStat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="min-w-[120px] rounded-[18px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-4 py-3 backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>

      <p
        className={`mt-1 text-base font-semibold ${
          positive === undefined
            ? "text-white"
            : positive
              ? "text-emerald-300"
              : "text-red-300"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
