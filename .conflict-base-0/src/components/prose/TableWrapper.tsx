interface TableWrapperProps {
  children: React.ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-[var(--color-border-default)]">
      <table className="w-full border-collapse text-sm [&_td]:border-t [&_td]:border-[var(--color-border-default)] [&_td]:px-4 [&_td]:py-3 [&_th]:border-b [&_th]:border-[var(--color-border-strong)] [&_th]:bg-[var(--color-surface-tertiary)] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[var(--color-text-primary)] [&_tr:nth-child(even)_td]:bg-[var(--color-surface-tertiary)]/30">
        {children}
      </table>
    </div>
  );
}
