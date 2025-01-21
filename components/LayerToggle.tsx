interface LayerToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function LayerToggle({ label, checked, onChange }: LayerToggleProps) {
  return (
    <label className="flex items-center gap-2 text-white cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span>{label}</span>
    </label>
  );
} 