import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { stages, functions, files } from "@/data";
import { useDebouncedValue } from "@/hooks";
const searchIndex=[...stages.map(x=>({title:x.name,detail:x.purpose,type:"Stage",path:"/journey",search:`${x.name} ${x.purpose}`.toLowerCase()})),...functions.map(x=>({title:x.name,detail:x.file,type:"Function",path:"/functions",search:`${x.name} ${x.file}`.toLowerCase()})),...files.map(x=>({title:x.name,detail:x.path,type:"File",path:"/architecture",search:`${x.name} ${x.path}`.toLowerCase()}))];

export const GlobalSearch=memo(function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState(""); const input = useRef<HTMLInputElement>(null); const navigate = useNavigate();
  const debouncedQuery=useDebouncedValue(query);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 0); }, [open]);
  const results = useMemo(() => {
    const q=debouncedQuery.trim().toLowerCase();if(!q)return[];return searchIndex.filter(x=>x.search.includes(q)).slice(0,12);
  }, [debouncedQuery]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/60 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
    <section role="dialog" aria-modal="true" aria-label="Search documentation" className="surface w-full max-w-2xl overflow-hidden shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700"><Search className="h-5 w-5 text-cyan-600"/><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Escape"&&onClose()} placeholder="Search stages, functions, files, modules…" aria-label="Search documentation" className="min-w-0 flex-1 bg-transparent text-base outline-none"/><button className="icon-button" onClick={onClose} aria-label="Close search"><X className="h-5 w-5"/></button></div>
      <div className="max-h-[55vh] overflow-y-auto p-2">{query && !results.length ? <p className="muted p-6 text-center">No documentation matched “{query}”.</p> : results.map((x,i)=><button key={`${x.type}-${x.title}-${i}`} className="flex w-full items-center gap-4 rounded-lg p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={()=>{navigate(x.path);onClose()}}><span className="badge">{x.type}</span><span className="min-w-0"><strong className="block truncate text-sm">{x.title}</strong><small className="muted block truncate">{x.detail}</small></span></button>)}</div>
      {!query && <p className="muted p-6 text-center text-sm">Start typing to explore the TOG-2 documentation.</p>}
    </section>
  </div>;
});
