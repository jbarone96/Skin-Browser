import PageHeader from "../components/PageHeader";

export default function Contact() {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Support"
          title="Contact"
          description="Reach out about bugs, suggestions, partnerships, or marketplace data feedback."
        />

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
            <p className="text-lg font-semibold text-white">
              Contact Page Coming Soon
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
