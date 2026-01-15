import { categories } from "@/data/listings";

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          selected === null
            ? "bg-primary text-primary-foreground glow-primary"
            : "bg-secondary text-secondary-foreground hover:bg-muted"
        }`}
      >
        Alla
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
            selected === category.id
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <span>{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
