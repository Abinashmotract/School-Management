import { fetchUnreadCount } from "@/lib/notifications-api";
import { useCallback, useEffect, useState } from "react";

export function useUnreadNotifications(pollMs = 30000) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setUnread(await fetchUnreadCount());
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, pollMs);
    return () => clearInterval(timer);
  }, [pollMs, refresh]);

  return { unread, refresh };
}
