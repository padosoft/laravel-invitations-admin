import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

export interface Column<T> {
  key: string;
  header: string;
  /** Render the cell. */
  cell: (row: T) => ReactNode;
  /** Optional accessor for client-side sorting; omit to make the column non-sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  className?: string;
}

type SortDir = 'asc' | 'desc';

/**
 * Sortable, paginated table with a sticky header. Skeleton/empty states are
 * handled by the surrounding <DataState>; this renders the ready data only.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  testId,
  pageSize: initialPageSize = 10,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  testId: string;
  pageSize?: number;
  caption?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [rows, columns, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function toggleSort(col: Column<T>) {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
    setPage(0);
  }

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full border-collapse text-sm" data-testid={testId}>
          {caption && <caption className="vh">{caption}</caption>}
          <thead className="sticky top-0 z-10" style={{ backgroundColor: 'var(--color-surface-2)' }}>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const ariaSort = !col.sortValue
                  ? undefined
                  : isSorted
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none';
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`px-4 py-3 font-semibold ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        data-testid={`${testId}-sort-${col.key}`}
                        className="inline-flex items-center gap-1 hover:opacity-80"
                      >
                        {col.header}
                        <span
                          className="transition-transform"
                          style={{
                            opacity: isSorted ? 1 : 0.3,
                            transform: isSorted && sortDir === 'desc' ? 'rotate(90deg)' : 'rotate(-90deg)',
                          }}
                        >
                          <Icon name="chevron" size={12} />
                        </span>
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${col.className ?? ''}`}
                    style={{ color: 'var(--color-text)' }}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2.5 text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <div className="flex items-center gap-2">
          <label htmlFor={`${testId}-pagesize`}>Rows per page</label>
          <select
            id={`${testId}-pagesize`}
            data-testid={`${testId}-pagesize`}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="rounded-md border px-2 py-1"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span>
            {sorted.length === 0
              ? '0'
              : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)}`}{' '}
            of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid={`${testId}-prev`}
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
              className="rounded-md border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Prev
            </button>
            <button
              type="button"
              data-testid={`${testId}-next`}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Next page"
              className="rounded-md border px-2 py-1 disabled:opacity-40"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton rows for the table's loading state. */
export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <table className="w-full text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c} className="px-4 py-3.5">
                  <div className="ia-skeleton h-4" style={{ width: c === 0 ? '60%' : '80%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
