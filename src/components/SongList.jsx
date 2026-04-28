import React, { useState } from 'react';
import { Search, ChevronRight, Hash } from 'lucide-react';

const SongList = ({ onSelectSong }) => {
  const [query, setQuery] = useState("");

  // Ejemplo de datos (reemplazar con datos de Firebase)
  const songs = [
    { id: 1, title: "Pescador de Hombres", category: "Entrada", key: "G" },
    { id: 2, title: "Cordero de Dios", category: "Ordinario", key: "Dm" },
    { id: 3, title: "Resucitó", category: "Salida", key: "Am" },
  ];

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Buscador Moderno */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-base"
          placeholder="Busca por título o letra..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Grid de Cantos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filteredSongs.map((song) => (
          <button
            key={song.id}
            onClick={() => onSelectSong(song)}
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all text-left group"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
                {song.category}
              </span>
              <span className="text-lg font-semibold text-slate-800 group-hover:text-primary">
                {song.title}
              </span>
              <div className="flex items-center gap-1 mt-1 text-slate-400 text-sm">
                <Hash size={14} /> Tono: {song.key}
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SongList;