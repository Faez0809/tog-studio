import { Link } from "react-router-dom";
export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-page-title" className="surface mx-auto max-w-xl p-8 text-center">
      <h1 id="not-found-page-title" className="text-2xl font-semibold text-slate-950">
        This path wandered off the graph
      </h1>
      <p className="muted mt-3">The page does not exist or may have moved.</p><Link className="btn-primary mt-6" to="/journey">Return to the journey</Link>
    </section>
  );
}
