import React, { useState } from 'react';
import { db, ref, push, set } from '../firebase'; // Importamos funciones de escritura

const AdminForm = () => {
  const [nuevoCanto, setNuevoCanto] = useState({
    titulo: '',
    tonoOriginal: 'C',
    cuerpo: '',
    categoria: ''
  });

  const guardarCanto = (e) => {
    e.preventDefault();
    const cantosRef = ref(db, 'cantos');
    const nuevoCantoRef = push(cantosRef); // Crea un ID único automático
    
    set(nuevoCantoRef, nuevoCanto)
      .then(() => {
        alert("¡Canto guardado con éxito!");
        setNuevoCanto({ titulo: '', tonoOriginal: 'C', cuerpo: '', categoria: '' });
      })
      .catch((error) => console.error("Error al guardar:", error));
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-xl m-4">
      <h2 className="text-xl font-bold mb-4">Añadir Nuevo Canto</h2>
      <form onSubmit={guardarCanto} className="space-y-4">
        <input 
          className="w-full p-3 bg-gray-100 rounded-xl"
          placeholder="Título del canto"
          value={nuevoCanto.titulo}
          onChange={(e) => setNuevoCanto({...nuevoCanto, titulo: e.target.value})}
          required
        />
        <select 
          className="w-full p-3 bg-gray-100 rounded-xl"
          value={nuevoCanto.tonoOriginal}
          onChange={(e) => setNuevoCanto({...nuevoCanto, tonoOriginal: e.target.value})}
        >
          {['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <textarea 
          className="w-full p-3 bg-gray-100 rounded-xl h-40 font-mono text-sm"
          placeholder="Escribe la letra con acordes así: [G]Señor mi [C]Dios..."
          value={nuevoCanto.cuerpo}
          onChange={(e) => setNuevoCanto({...nuevoCanto, cuerpo: e.target.value})}
          required
        />
        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">
          Guardar en la Nube
        </button>
      </form>
    </div>
  );
};

export default AdminForm;