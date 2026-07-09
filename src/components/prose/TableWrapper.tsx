interface TableWrapperProps {
  children: React.ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
      <table
        className="w-full border-collapse text-[length:var(--text-sm)] [&_td]:border-t [&_td]:border-[var(--border)] [&_td]:px-3.5 [&_td]:py-2.5 [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:bg-[var(--surface-2)] [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-[var(--fw-semibold)] [&_th]:text-[color:var(--text)] [&_tr:nth-child(even)_td]:bg-[var(--surface-2)]"
      >
        {children}
      </table>
    </div>
  );
}
