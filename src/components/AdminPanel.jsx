import React, { useState, useEffect, useRef } from 'react';
import { db, ref, push, set } from '../firebase';

const AdminPanel = ({ onClose, songToEdit, showToast, categorias = [] }) => {
  const [form, setForm] = useState({
    titulo: '', tonoOriginal: 'G', categoria: '', autor: '', cuerpo: ''
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const TONOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  useEffect(() => {
    if (songToEdit) {
      setForm({
        titulo: songToEdit.titulo || '',
        tonoOriginal: songToEdit.tonoOriginal || songToEdit.tonalidad || 'G',
        categoria: songToEdit.categoria || '',
        autor: songToEdit.autor || '',
        cuerpo: songToEdit.cuerpo || '',
      });
    } else {
      setForm({
        titulo: '', tonoOriginal: 'G', categoria: '', autor: '', cuerpo: ''
      });
    }
  }, [songToEdit]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.cuerpo.trim()) return;
    setSaving(true);
    try {
      const path = songToEdit
        ? `cantos/${songToEdit.id}`
        : `cantos/${push(ref(db, 'cantos')).key}`;
      await set(ref(db, path), { ...form, fechaUpdate: Date.now() });
      showToast(songToEdit ? 'Canto actualizado ✓' : 'Canto publicado ✓', 'success');
      onClose();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const insertChord = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = form.cuerpo.slice(0, start);
    const after = form.cuerpo.slice(start);
    const newVal = before + '[C]' + after;
    setForm(f => ({ ...f, cuerpo: newVal }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 1, start + 2); }, 0);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-slide-up">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm sticky top-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {songToEdit ? 'Editar canto' : 'Nuevo canto'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Usa [Acorde] para marcar acordes en la letra</p>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Título del canto</label>
          <input
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ej: Pescador de Hombres"
            value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tono original</label>
            <select
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
              value={form.tonoOriginal}
              onChange={e => setForm(f => ({ ...f, tonoOriginal: e.target.value }))}
            >
              {TONOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</label>
            <select
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base outline-none focus:ring-2 focus:ring-blue-500/20"
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
            >
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Autor / Compositor</label>
          <input
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Opcional"
            value={form.autor}
            onChange={e => setForm(f => ({ ...f, autor: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Letra con acordes</label>
            <button type="button" onClick={insertChord}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              + Insertar [acorde]
            </button>
          </div>
          <textarea
            ref={textareaRef}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[13px] leading-7 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[280px]"
            placeholder={`[G]Señor mi [C]Dios, al contemplar los [D]cielos...`}
            value={form.cuerpo}
            onChange={e => setForm(f => ({ ...f, cuerpo: e.target.value }))}
            required
          />
          <p className="text-xs text-slate-400">
            Formato: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">[G]</code> antes de la sílaba que lleva el acorde.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !form.titulo.trim() || !form.cuerpo.trim()}
          className="w-full py-5 rounded-3xl font-black text-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          {saving ? 'Guardando...' : (songToEdit ? 'Actualizar canto' : 'Publicar canto')}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;