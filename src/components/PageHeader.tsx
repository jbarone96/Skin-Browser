type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-400">{description}</p>
    </header>
  );
}
