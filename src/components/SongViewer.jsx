import React, { useState } from 'react';
import { ArrowLeft, Minus, Plus, Type, Share2 } from 'lucide-react';

const SongViewer = ({ song, onBack }) => {
  const [fontSize, setFontSize] = useState(18);
  const [transpose, setTranspose] = useState(0);

  // Ejemplo de contenido (esto vendría de tu base de datos)
  const lyrics = `[G] Tú has ve[D]nido a la o[Em]rilla...
[C] No has bus[Am]cado ni a sa[D]bios ni a ricos.
[G] Tan solo quie[D]res que yo te [Em]siga.`;

  return (
    <div className="max-w-2xl mx-auto pb-28 animate-in slide-in-from-right-4 duration-300">
      {/* Botón de regreso */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 mb-4 font-medium hover:text-primary px-2"
      >
        <ArrowLeft size={20} /> Lista de cantos
      </button>

      {/* Tarjeta del Canto */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
            {song.title}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{song.category} • Tono Original: {song.key}</p>
        </div>

        <div className="p-6 md:p-8">
          <pre 
            style={{ fontSize: `${fontSize}px` }}
            className="whitespace-pre-wrap font-mono leading-relaxed text-slate-700 overflow-x-auto"
          >
            {lyrics}
          </pre>
        </div>
      </div>

      {/* Controles Flotantes (Mobile First) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/95 backdrop-blur shadow-2xl rounded-2xl p-4 flex items-center justify-around text-white border border-white/10">
        {/* Control de Tono */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Tono</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setTranspose(t => t - 1)} className="p-1 hover:bg-white/10 rounded-lg"><Minus size={18} /></button>
            <span className="font-mono font-bold text-primary">{transpose > 0 ? `+${transpose}` : transpose}</span>
            <button onClick={() => setTranspose(t => t + 1)} className="p-1 hover:bg-white/10 rounded-lg"><Plus size={18} /></button>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-white/10" />

        {/* Control de Tamaño */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Letra</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-1 hover:bg-white/10 rounded-lg"><Type size={16} /></button>
            <button onClick={() => setFontSize(s => Math.min(30, s + 2))} className="p-1 hover:bg-white/10 rounded-lg"><Type size={22} /></button>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-white/10" />

        {/* Acción Compartir */}
        <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
          <span className="text-[10px] uppercase font-bold text-slate-400">Enviar</span>
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default SongViewer;