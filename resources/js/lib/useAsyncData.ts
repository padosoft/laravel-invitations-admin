import { useCallback, useEffect, useRef, useState } from 'react';
import type { LoadState } from '../components/DataState';
import { normalizeError } from '../api/client';

/**
 * Generic fetch-into-a-state-machine hook. Maps the lifecycle onto the
 * idle/loading/ready/error/empty contract; `isEmpty` decides ready-vs-empty so
 * an empty array surfaces the friendly empty state rather than a blank table.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  isEmpty: (data: T) => boolean,
): { state: LoadState; data: T | null; error: string | null; reload: () => void } {
  const [state, setState] = useState<LoadState>('loading');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  const run = useCallback(() => {
    const id = ++reqId.current;
    setState('loading');
    setError(null);
    fetcher()
      .then((result) => {
        if (id !== reqId.current) return; // stale response — a newer request won.
        setData(result);
        setState(isEmpty(result) ? 'empty' : 'ready');
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        setError(normalizeError(err).message);
        setState('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { state, data, error, reload: run };
}
