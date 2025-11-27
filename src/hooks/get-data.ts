import { useState, useEffect } from "react";

export function useMqttPolling(url, intervalMs = 5000) {
  const [lastMessage, setLastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;

    async function fetchMessages() {
      try {
        const res = await fetch(url);
        const data = await res.json();

        const latest = data.messages?.[0] || null;
        setLastMessage(latest);

        setLoading(false);
      } catch (err) {
        console.error("Polling error", err);
      }

      timer = setTimeout(fetchMessages, intervalMs);
    }

    fetchMessages();
    return () => clearTimeout(timer);

  }, [url, intervalMs]);

  return { lastMessage, loading };
}
