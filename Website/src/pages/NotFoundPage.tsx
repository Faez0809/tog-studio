import { Link } from "react-router-dom";
export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-page-title" className="surface mx-auto max-w-xl p-8 text-center">
      <h1 id="not-found-page-title" className="text-2xl font-semibold text-slate-950">
        This path wandered off the graph
      </h1>
      <p className="muted mt-3">The page does not exist or may have moved.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link className="btn-primary" to="/">Return home</Link><Link className="btn-secondary" to="/journey">Open journey</Link></div>
    </section>
  );
}
