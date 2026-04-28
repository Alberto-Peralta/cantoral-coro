import React, { useState, useEffect } from 'react';
import { db, ref, push, set } from '../firebase';
import VisualEditor from './VisualEditor';

const AdminPanel = ({ onClose, songToEdit, showToast }) => {  // ← Cambiado: alCerrar → onClose, cantoAEditar → songToEdit
  const [canto, setCanto] = useState({ 
    titulo: '', 
    tonoOriginal: 'C', 
    cuerpo: '',
    categoria: 'Ordinario',
    autor: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (songToEdit) {  // ← Cambiado: cantoAEditar → songToEdit
      setCanto({
        titulo: songToEdit.titulo || '',
        tonoOriginal: songToEdit.tonoOriginal || songToEdit.tonalidad || 'C',
        cuerpo: songToEdit.cuerpo || '',
        categoria: songToEdit.categoria || 'Ordinario',
        autor: songToEdit.autor || ''
      });
    }
  }, [songToEdit]);  // ← Cambiado: cantoAEditar → songToEdit

  const guardar = async (e) => {
    e.preventDefault();
    if (!canto.titulo.trim() || !canto.cuerpo.trim()) {
      if (showToast) showToast('Completa título y letra', 'error');
      return;
    }
    
    setSaving(true);
    
    const path = songToEdit  // ← Cambiado: cantoAEditar → songToEdit
      ? `cantos/${songToEdit.id}` 
      : `cantos/${push(ref(db, 'cantos')).key}`;
    
    try {
      await set(ref(db, path), {
        ...canto,
        fechaUpdate: Date.now()
      });
      if (showToast) showToast(songToEdit ? '¡Canto actualizado!' : '¡Canto publicado!', 'success');
      onClose();  // ← Cambiado: alCerrar → onClose
    } catch (error) {
      console.error("Error al guardar:", error);
      if (showToast) showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const TONOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const CATEGORIAS = ['Entrada', 'Ordinario', 'Comunión', 'Ofertorio', 'Salida', 'Mariano'];

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[100] flex flex-col animate-slide-up">
      
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {songToEdit ? '✏️ Editar Canto' : '✨ Nuevo Canto'}  {/* ← Cambiado */}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {songToEdit ? 'Modifica el canto existente' : 'Agrega un nuevo canto al repertorio'}  {/* ← Cambiado */}
          </p>
        </div>
        <button 
          onClick={onClose}  // ← Cambiado: alCerrar → onClose
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold active:scale-90 transition"
        >
          ✕
        </button>
      </div>
      
      {/* Formulario */}
      <form onSubmit={guardar} className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Título */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            📝 Título del canto
          </label>
          <input 
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-semibold transition"
            placeholder="Ej: Pescador de Hombres"
            value={canto.titulo} 
            onChange={e => setCanto({...canto, titulo: e.target.value})} 
            required 
          />
        </div>
        
        {/* Grid de opciones */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              🎵 Tono original
            </label>
            <select 
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              value={canto.tonoOriginal} 
              onChange={e => setCanto({...canto, tonoOriginal: e.target.value})}
            >
              {TONOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              📂 Categoría
            </label>
            <select 
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20"
              value={canto.categoria} 
              onChange={e => setCanto({...canto, categoria: e.target.value})}
            >
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        {/* Autor */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            ✍️ Autor / Compositor (opcional)
          </label>
          <input 
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 transition"
            placeholder="Ej: Cesáreo Gabaráin"
            value={canto.autor} 
            onChange={e => setCanto({...canto, autor: e.target.value})}
          />
        </div>
        
        {/* Editor Visual de Letra */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            🎼 Letra con acordes
          </label>
          <VisualEditor 
            value={canto.cuerpo}
            onChange={(nuevoTexto) => setCanto({...canto, cuerpo: nuevoTexto})}
            placeholder="[G]Señor mi [C]Dios, al contemplar los [D]cielos..."
          />
        </div>
        
        {/* Botón guardar */}
        <button 
          type="submit" 
          disabled={saving}
          className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : (songToEdit ? '✅ ACTUALIZAR CANTO' : '🚀 PUBLICAR CANTO')}
        </button>
        
      </form>
    </div>
  );
};

export default AdminPanel;