import { Eye } from "lucide-react";
export function VisualizationTypeBadge({type}:{type:string}){return <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700"><Eye className="h-3 w-3"/>{type}</span>}
