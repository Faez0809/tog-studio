type FailureCasePanelProps = {
  failureCases: string[];
};

export function FailureCasePanel({ failureCases }: FailureCasePanelProps) {
  return (
    <section className="rounded-md border border-rose-200 bg-rose-50 p-4">
      <h3 className="text-sm font-semibold text-rose-900">Failure Cases</h3>
      <ul className="mt-3 space-y-2">
        {failureCases.map((failureCase) => (
          <li key={failureCase} className="text-sm leading-6 text-rose-950">
            {failureCase}
          </li>
        ))}
      </ul>
    </section>
  );
}
