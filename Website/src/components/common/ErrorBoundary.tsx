import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("TOG-2 UI error", error, info); }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="grid min-h-screen place-items-center p-6"><section className="surface max-w-lg p-8 text-center" role="alert"><p className="eyebrow">Something went wrong</p><h1 className="section-title mt-2">The visualizer hit an unexpected state.</h1><p className="muted mt-3">Your data is safe. Reload the application to start from a clean view.</p><button className="btn-primary mt-6" onClick={() => location.reload()}>Reload visualizer</button></section></main>;
  }
}
