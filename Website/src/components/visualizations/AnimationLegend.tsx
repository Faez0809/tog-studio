export function AnimationLegend({ items }: { items: { label: string; color: string }[] }) {
  return <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">{items.map((item) => <span key={item.label} className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</span>)}</div>;
}
