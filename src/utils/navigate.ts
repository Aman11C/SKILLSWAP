import { useState, useCallback } from 'react';

export function useNavigate() {
  const [, forceUpdate] = useState(0);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    forceUpdate(n => n + 1);
  }, []);

  return navigate;
}

export function useLocation() {
  return window.location.pathname;
}

export function Navigate({ to }: { to: string }) {
  window.history.pushState({}, '', to);
  return null;
}
