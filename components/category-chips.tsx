type CategoryChipsProps = {
  categories: Array<{ name: string; slug: string }>;
};

export function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <nav aria-label="Menü kategorileri" className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
      <div className="flex w-max gap-2">
        {categories.map((category, index) => (
          <a
            className={`rounded-full px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              index === 0 ? "bg-ink text-white" : "bg-white text-zinc-600 hover:text-brand"
            }`}
            href={`#${category.slug}`}
            key={category.slug}
          >
            {category.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
