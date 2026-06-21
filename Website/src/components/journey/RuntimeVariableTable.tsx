type RuntimeVariableTableProps = {
  variables: string[];
};

export function RuntimeVariableTable({ variables }: RuntimeVariableTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Variable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {variables.map((variable) => (
            <tr key={variable}>
              <td className="px-3 py-2 font-mono text-xs text-slate-700">{variable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
