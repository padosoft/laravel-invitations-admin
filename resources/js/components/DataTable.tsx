import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from './Icon';
import { card, td as tdStyle, th as thStyle, thSortBtn, pagerBtn, selSm } from './ds';

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

const SKELETON: CSSProperties = {
  height: 12,
  borderRadius: 4,
  background: 'var(--skeleton)',
  backgroundSize: '200% 100%',
  animation: 'pds-shimmer 1.4s linear infinite',
};

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

  function align(a?: 'left' | 'right' | 'center'): CSSProperties['textAlign'] {
    return a === 'right' ? 'right' : a === 'center' ? 'center' : 'left';
  }

  return (
    <div style={card}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }} data-testid={testId}>
          {caption && <caption className="vh">{caption}</caption>}
          <thead style={{ background: 'var(--bg-surface)' }}>
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
                  <th key={col.key} scope="col" aria-sort={ariaSort} style={{ ...thStyle, textAlign: align(col.align) }}>
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        data-testid={`${testId}-sort-${col.key}`}
                        style={thSortBtn}
                      >
                        {col.header}
                        {isSorted && <Icon name={sortDir === 'asc' ? 'up' : 'down'} size={12} />}
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
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.className}
                    style={{ ...tdStyle, textAlign: align(col.align), color: 'var(--text-mid)' }}
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
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          borderTop: '1px solid var(--line-1)',
          background: 'var(--bg-surface)',
        }}
      >
        <label
          htmlFor={`${testId}-pagesize`}
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-low)' }}
        >
          <span>Rows</span>
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              id={`${testId}-pagesize`}
              data-testid={`${testId}-pagesize`}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              style={selSm}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'var(--text-low)' }}>
              <Icon name="chevDown" size={14} />
            </span>
          </span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-low)' }}>
            {sorted.length === 0
              ? '0'
              : `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)}`}{' '}
            of {sorted.length}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              type="button"
              data-testid={`${testId}-prev`}
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
              style={{ ...pagerBtn, opacity: safePage === 0 ? 0.4 : 1 }}
            >
              <Icon name="chevLeft" size={14} />
            </button>
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-mid)', padding: '0 6px' }}
            >
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              data-testid={`${testId}-next`}
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Next page"
              style={{ ...pagerBtn, opacity: safePage >= pageCount - 1 ? 0.4 : 1 }}
            >
              <Icon name="chevRight" size={14} />
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
    <div style={card}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderTop: r === 0 ? 'none' : '1px solid var(--line-faint)' }}>
              {Array.from({ length: columns }).map((__, c) => (
                <td key={c} style={{ padding: '15px 16px' }}>
                  <div style={{ ...SKELETON, width: c === 0 ? '60%' : '80%' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
