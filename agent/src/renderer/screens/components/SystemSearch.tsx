import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../utils/ContextProvider";

const SystemSearch: React.FC = () => {
  const { setSystemInfo, user } = useAppContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch systems as user types
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://support-app-backend.vercel.app/system-info/search?q=${query}`);
        const data = await res.json();
        setResults(data.slice(0, 5)); // max 5
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = async (id: string) => {
    try {
      const res = await fetch(`https://support-app-backend.vercel.app/system-info/${id}`);
      const data = await res.json();
      setSystemInfo(data); // ✅ update context with full system info
      setResults([]);
      setQuery("");
    } catch (err) {
      console.error("Failed to fetch system details", err);
    }
  };

  if (user?.role !== "ADMIN") return null; // ✅ only admins

  return (
    <div className="relative w-64">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquisar sistema..."
        className="w-full px-4 py-3 border-2 border-border rounded-md outline-none bg-background/50 text-text ring-0"
      />
      {loading && <div className="bg-background absolute top-full left-0 p-2 text-sm">Carregando...</div>}
      {results.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-background border-border rounded shadow-lg mt-1 z-50">
          {results.map((sys) => (
            <li
              key={sys.id}
              className="p-2 transition-all duration-150 ease-in-out hover:bg-border cursor-pointer"
              onClick={() => handleSelect(sys.id)}
            >
              {sys.hostname} {sys.network.adapters[0].ip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemSearch;
