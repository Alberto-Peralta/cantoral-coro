import React from 'react';
import { transponerAcorde } from '../utils/transposer';
import { db, ref, set } from '../firebase';

const VisorCanto = ({ cancion, transporte, alCerrar, alEditar }) => {

  const borrarCanto = () => {
    if (window.confirm("¿Eliminar este canto del repertorio?")) {
      set(ref(db, `cantos/${cancion.id}`), null).then(() => alCerrar());
    }
  };

  const procesarTexto = (texto) => {
    if (!texto) return "";

    return texto.split(/(\[.*?\])/g).map((parte, i) => {
      if (parte.startsWith('[')) {
        const acorde = parte.slice(1, -1);

        return (
          <span
            key={i}
            className="inline-block text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-md mx-0.5"
          >
            {transponerAcorde(acorde, transporte)}
          </span>
        );
      }

      return (
        <span key={i} className="text-slate-200">
          {parte}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade">

      {/* HEADER */}
      <div className="sticky top-0 z-20 glass p-4 flex items-center justify-between">

        <button
          onClick={alCerrar}
          className="w-10 h-10 rounded-xl bg-white/10 text-white text-lg active:scale-90 transition"
        >
          ✕
        </button>

        <div className="text-center max-w-[180px]">
          <h2 className="font-bold text-white truncate">{cancion.titulo}</h2>
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase">
            Tono {cancion.tonoOriginal}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alEditar(cancion)}
            className="w-10 h-10 rounded-xl bg-white/10 text-white active:scale-90 transition"
          >
            ✏️
          </button>

          <button
            onClick={borrarCanto}
            className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 active:scale-90 transition"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-6 pb-40 max-w-2xl mx-auto w-full">
        <pre className="whitespace-pre-wrap text-lg leading-9">
          {procesarTexto(cancion.cuerpo)}
        </pre>
      </div>

      {/* CONTROL DE TRANSPORTE */}
      <div className="fixed bottom-6 left-4 right-4 glass rounded-3xl p-5 flex items-center justify-between">

        <button
          onClick={() => transporte > -12 && (window.dispatchEvent(new CustomEvent('transporte', { detail: transporte - 1 })))}
          className="w-12 h-12 rounded-xl bg-white/10 text-white text-2xl active:scale-90 transition"
        >
          −
        </button>

        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase">Transporte</p>
          <p className="text-xl font-bold">
            {transporte > 0 ? `+${transporte}` : transporte}
          </p>
        </div>

        <button
          onClick={() => transporte < 12 && (window.dispatchEvent(new CustomEvent('transporte', { detail: transporte + 1 })))}
          className="w-12 h-12 rounded-xl bg-white/10 text-white text-2xl active:scale-90 transition"
        >
          +
        </button>
      </div>

    </div>
  );
};

export default VisorCanto;