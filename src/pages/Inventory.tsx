import PageHeader from "../components/PageHeader";

export default function Inventory() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="User"
          title="Inventory"
          description="View connected Steam inventory items, saved skins, and future watchlist activity."
        />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-semibold text-white">
              Inventory View Coming Soon
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              This page will later show Steam items, favorites, and listing
              insights.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
