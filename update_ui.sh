#!/bin/bash

# 1. Actualizar VisorCanto.jsx con Edición y Borrado
cat << 'INNER' > src/components/VisorCanto.jsx
import React from 'react';
import { transponerAcorde } from '../utils/transposer';
import { db, ref, set } from '../firebase';

const VisorCanto = ({ cancion, transporte, alCerrar, alEditar }) => {
  const borrarCanto = () => {
    if (window.confirm("¿Estás seguro de borrar este canto?")) {
      set(ref(db, `cantos/${cancion.id}`), null).then(() => alCerrar());
    }
  };

  const procesarTexto = (texto) => {
    if (!texto) return "";
    return texto.split(/(\[.*?\])/g).map((parte, i) => {
      if (parte.startsWith('[')) {
        const acorde = parte.slice(1, -1);
        return (
          <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded shadow-sm mx-0.5">
            {transponerAcorde(acorde, transporte)}
          </span>
        );
      }
      return <span key={i} className="text-slate-700">{parte}</span>;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-start p-6 bg-white border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 leading-tight">{cancion.titulo}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
            TONO: {cancion.tonoOriginal}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => alEditar(cancion)} className="p-2 bg-amber-50 text-amber-600 rounded-lg">📝</button>
          <button onClick={borrarCanto} className="p-2 bg-red-50 text-red-600 rounded-lg">🗑️</button>
        </div>
      </div>
      
      <div className="p-6 pb-40">
        <pre className="whitespace-pre-wrap font-sans leading-loose text-xl tracking-wide">
          {procesarTexto(cancion.cuerpo)}
        </pre>
      </div>
    </div>
  );
};
export default VisorCanto;
INNER

# 2. Actualizar AdminPanel.jsx para permitir Edición
cat << 'INNER' > src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { db, ref, push, set } from '../firebase';

const AdminPanel = ({ alCerrar, cantoAEditar }) => {
  const [canto, setCanto] = useState({ titulo: '', tonoOriginal: 'C', cuerpo: '' });

  useEffect(() => {
    if (cantoAEditar) setCanto(cantoAEditar);
  }, [cantoAEditar]);

  const guardar = (e) => {
    e.preventDefault();
    const path = cantoAEditar ? `cantos/${cantoAEditar.id}` : `cantos/${push(ref(db, 'cantos')).key}`;
    set(ref(db, path), {
      titulo: canto.titulo,
      tonoOriginal: canto.tonoOriginal,
      cuerpo: canto.cuerpo
    }).then(() => {
      alert(cantoAEditar ? "Actualizado" : "Guardado");
      alCerrar();
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-white shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-black">{cantoAEditar ? 'Editar Canto' : 'Nuevo Canto'}</h2>
        <button onClick={alCerrar} className="text-slate-400 font-bold text-xl">✕</button>
      </div>
      
      <form onSubmit={guardar} className="p-6 space-y-4 flex-1 flex flex-col overflow-y-auto">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 ml-2">TÍTULO</label>
          <input className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                 value={canto.titulo} onChange={e => setCanto({...canto, titulo: e.target.value})} required />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-400 ml-2">TONO BASE</label>
          <select className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm outline-none"
                  value={canto.tonoOriginal} onChange={e => setCanto({...canto, tonoOriginal: e.target.value})}>
            {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="space-y-1 flex-1 flex flex-col">
          <label className="text-xs font-bold text-slate-400 ml-2">LETRA Y ACORDES</label>
          <textarea className="w-full flex-1 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: [G]Señor mi [C]Dios..." value={canto.cuerpo} 
                    onChange={e => setCanto({...canto, cuerpo: e.target.value})} required />
        </div>

        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 active:scale-95 transition-all">
          {cantoAEditar ? 'GUARDAR CAMBIOS' : 'PUBLICAR CANTO'}
        </button>
      </form>
    </div>
  );
};
export default AdminPanel;
INNER

# 3. Actualizar App.jsx con el nuevo flujo
cat << 'INNER' > src/App.jsx
import React, { useState, useEffect } from 'react';
import { db, ref, onValue } from './firebase';
import VisorCanto from './components/VisorCanto';
import AdminPanel from './components/AdminPanel';

function App() {
  const [canciones, setCanciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [transporte, setTransporte] = useState(0);
  const [admin, setAdmin] = useState({ abierto: false, canto: null });

  useEffect(() => {
    return onValue(ref(db, 'cantos'), (snapshot) => {
      const data = snapshot.val();
      setCanciones(data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : []);
    });
  }, []);

  const handleEditar = (canto) => {
    setAdmin({ abierto: true, canto: canto });
    setSeleccion(null);
  };

  if (admin.abierto) return <AdminPanel cantoAEditar={admin.canto} alCerrar={() => setAdmin({ abierto: false, canto: null })} />;

  if (seleccion) return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <button onClick={() => {setSeleccion(null); setTransporte(0)}} 
              className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-md w-10 h-10 rounded-full shadow-md flex items-center justify-center font-bold">←</button>
      
      <VisorCanto cancion={seleccion} transporte={transporte} alCerrar={() => setSeleccion(null)} alEditar={handleEditar} />
      
      <div className="fixed bottom-8 left-4 right-4 bg-slate-900/95 backdrop-blur-lg text-white p-5 rounded-[2rem] flex justify-between items-center shadow-2xl">
        <button onClick={() => setTransporte(t => t - 1)} className="w-12 h-12 bg-white/10 rounded-2xl text-2xl font-light active:bg-white/20">−</button>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Transporte</p>
          <p className="font-mono text-xl font-bold">{transporte > 0 ? `+${transporte}` : transporte}</p>
        </div>
        <button onClick={() => setTransporte(t => t + 1)} className="w-12 h-12 bg-white/10 rounded-2xl text-2xl font-light active:bg-white/20">+</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen p-6 pb-28">
      <header className="mb-8 mt-4 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cantoral<span className="text-blue-600">.</span></h1>
        <p className="text-slate-400 font-medium">Coro San Alberto</p>
      </header>

      <div className="sticky top-4 z-40 mb-8">
        <input className="w-full p-5 rounded-[1.5rem] bg-white border-none shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 transition-all"
               placeholder="Busca un canto o tono..." onChange={e => setBusqueda(e.target.value)} />
      </div>

      <div className="space-y-4">
        {canciones.filter(c => c.titulo.toLowerCase().includes(busqueda.toLowerCase())).map(c => (
          <div key={c.id} onClick={() => setSeleccion(c)} 
               className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-all">
            <span className="font-bold text-slate-700">{c.titulo}</span>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">{c.tonoOriginal}</span>
          </div>
        ))}
      </div>

      <button onClick={() => setAdmin({ abierto: true, canto: null })} 
              className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-400/40 flex items-center justify-center text-3xl font-bold active:scale-90 transition-all">
        +
      </button>
    </div>
  );
}
export default App;
INNER

echo "Interfaz actualizada. Refrescando Vite..."
