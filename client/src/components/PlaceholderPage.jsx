const PlaceholderPage = ({ title, subtitle, description }) => {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 text-on-background">
      <div className="rounded-none border border-neutral-800 bg-surface p-8">
        <p className="font-caption text-caption uppercase tracking-widest text-on-surface-variant">{subtitle}</p>
        <h1 className="mt-3 font-h1 text-h1 text-primary">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary">{description}</p>
      </div>
    </section>
  );
};

export default PlaceholderPage;