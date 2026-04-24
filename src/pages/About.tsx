import PageHeader from "../components/PageHeader";

export default function About() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Platform"
          title="About"
          description="Skin Browser is built to help players browse, compare, and eventually price-check Counter-Strike skins across the market."
        />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-semibold text-white">
              About Page Coming Soon
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
