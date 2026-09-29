import { getCategoryColor } from "@/lib/charts";

export default function CategoryBadge({ category }: { category: string }) {
  const color = getCategoryColor(category);

  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-body text-xs"
      style={{ backgroundColor: `${color}26`, color }}
    >
      {category}
    </span>
  );
}
