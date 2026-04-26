// usePagination keeps shared frontend state logic reusable.
import { useMemo, useState } from "react";

// Expose pagination state and helper actions through one reusable hook.
export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const params = useMemo(() => ({ page, limit }), [page, limit]);

  return { page, setPage, limit, setLimit, params };
};
