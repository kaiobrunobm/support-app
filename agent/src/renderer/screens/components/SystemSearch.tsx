import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../utils/ContextProvider";
import { DesktopTowerIcon, DotOutlineIcon } from "@phosphor-icons/react";

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
    <div className="relative w-[420px]">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquisar sistema..."
        className="w-full px-4 py-3 border-2 border-border rounded-md outline-none bg-background/50 text-text ring-0"
      />
      {loading && <DotOutlineIcon size={96} weight="fill" className="animate-pulse text-text absolute top-16 left-40"/>}
      {results.length > 0 && (
        <ul className="absolute top-full left-[-50px] w-[500px] bg-background border border-border rounded-md shadow-lg mt-1 z-50">
          {results.map((sys, index) => (
            <li
              key={sys.id}
              className={`flex gap-4 px-6 py-2 transition-all duration-150 ease-in-out hover:bg-border/20 cursor-pointer ${index > 0 && 'border-t border-border'}`}
              onClick={() => handleSelect(sys.id)}
            >
              <DesktopTowerIcon size={40} weight="fill" className="text-text text-sm"/>
              <div className="flex items-center gap-4">
                <span>{sys.hostname}</span>
                <div className="h-1/2 w-[1px] bg-border"/>
                 <span>{sys.network.adapters[0].ip}</span>
                 <div className="h-1/2 w-[1px] bg-border"/>
                  <span>{sys.users[0].username}</span>
              </div>
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SystemSearch;
