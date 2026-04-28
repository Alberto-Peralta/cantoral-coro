#!/bin/bash

# 1. Crear estructura de carpetas
mkdir -p src/components src/utils

# 2. Crear archivo firebase.js
cat << 'INNER' > src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAe3452QDD533IatbVVhAuhdlyFGuDQ4Fk",
  authDomain: "notebookcoro.firebaseapp.com",
  databaseURL: "https://notebookcoro-default-rtdb.firebaseio.com",
  projectId: "notebookcoro",
  storageBucket: "notebookcoro.firebasestorage.app",
  messagingSenderId: "210497174745",
  appId: "1:210497174745:web:2a36f91664b3939a8492c8",
  measurementId: "G-CC20MLQXXT"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, onValue, push, set };
INNER

# 3. Crear archivo transposer.js
cat << 'INNER' > src/utils/transposer.js
const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const transponerAcorde = (acorde, semitonos) => {
  const match = acorde.match(/^([A-G]#?)(.*)/);
  if (!match) return acorde;
  const notaBase = match[1];
  const adorno = match[2];
  const indiceActual = notas.indexOf(notaBase);
  if (indiceActual === -1) return acorde;
  let nuevoIndice = (indiceActual + semitonos) % 12;
  if (nuevoIndice < 0) nuevoIndice += 12;
  return notas[nuevoIndice] + adorno;
};
INNER

# 4. Crear VisorCanto.jsx
cat << 'INNER' > src/components/VisorCanto.jsx
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
        return <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{nuevoAcorde}</span>;
      }
      return <span key={i}>{parte}</span>;
    });
  };
  return (
    <div className="p-6 bg-white min-h-screen pb-32">
      <h2 className="text-3xl font-black mb-2 text-slate-800">{cancion.titulo}</h2>
      <pre className="whitespace-pre-wrap font-sans leading-loose text-lg text-slate-700">{procesarTexto(cancion.cuerpo)}</pre>
    </div>
  );
};
export default VisorCanto;
INNER

# 5. Crear AdminPanel.jsx
cat << 'INNER' > src/components/AdminPanel.jsx
import React, { useState } from 'react';
import { db, ref, push, set } from '../firebase';

const AdminPanel = ({ alCerrar }) => {
  const [canto, setCanto] = useState({ titulo: '', tonoOriginal: 'C', cuerpo: '' });
  const guardar = (e) => {
    e.preventDefault();
    set(push(ref(db, 'cantos')), canto)
      .then(() => { alert("Guardado!"); setCanto({ titulo: '', tonoOriginal: 'C', cuerpo: '' }); alCerrar(); });
  };
  return (
    <div className="fixed inset-0 bg-white z-[100] p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Nuevo Canto</h2>
        <button onClick={alCerrar} className="text-red-500 font-bold">Cerrar</button>
      </div>
      <form onSubmit={guardar} className="space-y-4 flex flex-col flex-1">
        <input className="p-4 bg-slate-100 rounded-xl" placeholder="Título" value={canto.titulo} onChange={e => setCanto({...canto, titulo: e.target.value})} required />
        <textarea className="flex-1 p-4 bg-slate-100 rounded-xl font-mono" placeholder="[C]Letra..." value={canto.cuerpo} onChange={e => setCanto({...canto, cuerpo: e.target.value})} required />
        <button type="submit" className="py-4 bg-blue-600 text-white rounded-xl font-bold">Publicar</button>
      </form>
    </div>
  );
};
export default AdminPanel;
INNER

# 6. Crear App.jsx
cat << 'INNER' > src/App.jsx
import React, { useState, useEffect } from 'react';
import { db, ref, onValue } from './firebase';
import VisorCanto from './components/VisorCanto';
import AdminPanel from './components/AdminPanel';

function App() {
  const [canciones, setCanciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cancionSeleccionada, setCancionSeleccionada] = useState(null);
  const [transporte, setTransporte] = useState(0);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  useEffect(() => {
    onValue(ref(db, 'cantos'), (snapshot) => {
      const data = snapshot.val();
      if (data) setCanciones(Object.keys(data).map(key => ({ id: key, ...data[key] })));
    });
  }, []);

  if (mostrarAdmin) return <AdminPanel alCerrar={() => setMostrarAdmin(false)} />;
  if (cancionSeleccionada) return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <button onClick={() => {setCancionSeleccionada(null); setTransporte(0)}} className="p-4 text-blue-500 font-bold">← Volver</button>
      <VisorCanto cancion={cancionSeleccionada} transporte={transporte} />
      <div className="fixed bottom-6 left-4 right-4 bg-black text-white p-4 rounded-2xl flex justify-between items-center">
        <button onClick={() => setTransporte(t => t - 1)} className="w-10 h-10 bg-white/20 rounded">-</button>
        <span>Tono: {transporte}</span>
        <button onClick={() => setTransporte(t => t + 1)} className="w-10 h-10 bg-white/20 rounded">+</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen p-4 pb-20">
      <h1 className="text-3xl font-black py-6">Cantoral 🎸</h1>
      <input className="w-full p-4 rounded-xl shadow-sm mb-6" placeholder="Buscar..." onChange={e => setBusqueda(e.target.value)} />
      {canciones.filter(c => c.titulo.toLowerCase().includes(busqueda.toLowerCase())).map(c => (
        <div key={c.id} onClick={() => setCancionSeleccionada(c)} className="bg-white p-4 rounded-xl mb-2 shadow-sm">{c.titulo}</div>
      ))}
      <button onClick={() => setMostrarAdmin(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-2xl shadow-xl">+</button>
    </div>
  );
}
export default App;
INNER

echo "Estructura creada. Instalando firebase..."
npm install firebase
echo "Listo. Ejecuta: npm run dev -- --host"
