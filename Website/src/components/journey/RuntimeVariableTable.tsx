type RuntimeVariableTableProps = {
  variables: string[];
};

export function RuntimeVariableTable({ variables }: RuntimeVariableTableProps) {
  return (
    <div className="max-w-full overflow-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[280px] divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-semibold">Variable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {variables.map((variable) => (
            <tr key={variable}>
              <td className="break-all px-3 py-2 font-mono text-xs text-slate-700">{variable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
