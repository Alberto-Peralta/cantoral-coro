import React from 'react';
import { transponerAcorde } from '../utils/transposer';

const VisorCanto = ({ cancion, transporte }) => {
  const procesarTexto = (texto) => {
    if (!texto) return "";
    const partes = texto.split(/(\[.*?\])/g);
    
    return partes.map((parte, i) => {
      if (parte.startsWith('[')) {
        const acorde = parte.slice(1, -1);
        const nuevoAcorde = transponerAcorde(acorde, transporte);
        return (
          <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">
            {nuevoAcorde}
          </span>
        );
      }
      return <span key={i}>{parte}</span>;
    });
  };

  return (
    <div className="p-6 bg-white min-h-screen pb-32">
      <h2 className="text-3xl font-black mb-2 text-slate-800">{cancion.titulo}</h2>
      <p className="text-sm text-slate-400 mb-6 uppercase tracking-widest">
        Tono Original: {cancion.tonoOriginal}
      </p>
      <pre className="whitespace-pre-wrap font-sans leading-loose text-lg text-slate-700">
        {procesarTexto(cancion.cuerpo)}
      </pre>
    </div>
  );
};

export default VisorCanto;