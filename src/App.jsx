import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Plus, Music, ChevronRight, ArrowLeft,
  Minus, Plus as PlusIcon, Type, Sun, Moon, Share2,
  Trash2, Pencil, BookOpen, X, Check, AlertCircle,
  Music2, Bookmark
} from 'lucide-react';
import { db, ref, onValue, push, set } from './firebase';
import { transponerAcorde } from './utils/transposer';

// ─── Constantes ────────────────────────────────────────────────────────────
const TONOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CATEGORIAS = ['Todos', 'Entrada', 'Ordinario', 'Comunión', 'Ofertorio', 'Salida', 'Mariano'];
const CAT_COLOR = {
  Entrada:   { bg: 'bg-amber-50 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
  Ordinario: { bg: 'bg-blue-50 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300' },
  Comunión:  { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  Ofertorio: { bg: 'bg-emerald-50 dark:bg-emerald-900/30',text: 'text-emerald-700 dark:text-emerald-300' },
  Salida:    { bg: 'bg-rose-50 dark:bg-rose-900/30',     text: 'text-rose-700 dark:text-rose-300' },
  Mariano:   { bg: 'bg-sky-50 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-300' },
};
const DEFAULT_CAT = { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' };

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold animate-slide-up
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
};

// ─── Badge de categoría ─────────────────────────────────────────────────────
const CatBadge = ({ cat, small = false }) => {
  const c = CAT_COLOR[cat] || DEFAULT_CAT;
  return (
    <span className={`inline-block rounded-lg font-bold uppercase tracking-widest ${small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'} ${c.bg} ${c.text}`}>
      {cat}
    </span>
  );
};

// ─── Procesador de acordes ──────────────────────────────────────────────────
const ProcesarLetra = ({ texto, transporte, fontSize }) => {
  if (!texto) return null;
  
  const procesarLinea = (linea, numLinea) => {
    // Encuentra todos los acordes en la línea
    const acordes = [];
    let textoLimpio = linea;
    
    // Extrae los acordes y crea marcadores de posición
    const regex = /\[([^\]]+)\]/g;
    let match;
    let offset = 0;
    
    while ((match = regex.exec(linea)) !== null) {
      const acordeOriginal = match[1];
      const acordeTranspuesto = transponerAcorde(acordeOriginal, transporte);
      const posicion = match.index - offset;
      
      acordes.push({
        acorde: acordeTranspuesto,
        posicion: posicion,
        original: match[0]
      });
      
      // Reemplaza [acorde] con espacios para mantener alineación
      const espacios = ' '.repeat(match[0].length);
      textoLimpio = textoLimpio.slice(0, match.index - offset) + espacios + textoLimpio.slice(match.index - offset + match[0].length);
      offset += match[0].length - espacios.length;
    }
    
    if (acordes.length === 0) {
      return <div key={numLinea} className="leading-loose">{linea}</div>;
    }
    
    // Crea la línea superior con acordes
    let lineaAcordes = '';
    let ultimaPos = 0;
    
    for (const acorde of acordes) {
      // Añade espacios hasta la posición del acorde
      const espaciosNecesarios = acorde.posicion - ultimaPos;
      lineaAcordes += ' '.repeat(Math.max(0, espaciosNecesarios));
      lineaAcordes += acorde.acorde;
      ultimaPos = acorde.posicion + acorde.acorde.length;
    }
    
    return (
      <div key={numLinea} className="relative my-3" style={{ minHeight: `${fontSize * 1.5}px` }}>
        <div className="text-blue-600 dark:text-blue-400 font-bold absolute -top-4 left-0 whitespace-pre font-mono" style={{ fontSize: `${fontSize * 0.7}px`, letterSpacing: '0.5px' }}>
          {lineaAcordes}
        </div>
        <div className="text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap pt-3">
          {textoLimpio}
        </div>
      </div>
    );
  };
  
  const lineas = texto.split('\n');
  
  return (
    <div style={{ fontSize: `${fontSize}px` }} className="leading-normal">
      {lineas.map((linea, idx) => procesarLinea(linea, idx))}
    </div>
  );
};

// ─── Modal de confirmación ──────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <Trash2 size={22} className="text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors">
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// ─── Visor de Canto ─────────────────────────────────────────────────────────
const SongDetail = ({ song, onBack, onEdit, showToast }) => {
  const [fontSize, setFontSize] = useState(17);
  const [transpose, setTranspose] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    set(ref(db, `cantos/${song.id}`), null)
      .then(() => { showToast('Canto eliminado', 'success'); onBack(); })
      .catch(() => showToast('Error al eliminar', 'error'));
  };

  const handleShare = async () => {
    const text = `🎵 ${song.titulo}\nTono: ${song.tonoOriginal || song.tonalidad || 'N/A'}\n\n${song.cuerpo || ''}`;
    if (navigator.share) {
      await navigator.share({ title: song.titulo, text }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      showToast('Copiado al portapapeles', 'success');
    }
  };

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          title="¿Eliminar canto?"
          message={`"${song.titulo}" se eliminará permanentemente del cantoral.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="max-w-3xl mx-auto pb-36 animate-fade-in">

        {/* Barra de navegación */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors group">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:-translate-x-1 transition-transform">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm hidden sm:inline">Volver al cantoral</span>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(song)} title="Editar"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
              <Pencil size={17} />
            </button>
            <button onClick={() => setShowConfirm(true)} title="Eliminar"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all">
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
          
          {/* Cabecera del canto */}
          <div className="relative px-7 pt-8 pb-7 border-b border-slate-50 dark:border-slate-800 overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute -top-6 -right-6 opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
              <Music2 size={180} />
            </div>
            
            <div className="relative space-y-3">
              <CatBadge cat={song.categoria || song.tonoOriginal} />
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {song.titulo}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                {song.autor && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen size={14} /> {song.autor}
                  </span>
                )}
                {(song.tonoOriginal || song.tonalidad) && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-xs">
                    Tono: {song.tonoOriginal || song.tonalidad}
                    {transpose !== 0 && (
                      <span className="text-amber-600 dark:text-amber-400 ml-1">
                        → {transponerAcorde(song.tonoOriginal || song.tonalidad || 'C', transpose)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contenido de la letra */}
          <div className="px-7 py-8 overflow-x-auto">
            {song.cuerpo ? (
              <ProcesarLetra texto={song.cuerpo} transporte={transpose} fontSize={fontSize} />
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                <Music2 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Este canto no tiene letra registrada aún.</p>
              </div>
            )}
          </div>
        </div>

        {/* Barra de controles flotante */}
        <div className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-50">
          <div className="bg-slate-950/95 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl border border-white/[0.06]">
            
            {/* Control de tono */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Tono</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setTranspose(t => Math.max(-12, t - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors active:scale-90">
                  <Minus size={14} />
                </button>
                <span className="font-mono font-black text-blue-400 w-8 text-center tabular-nums">
                  {transpose >= 0 ? `+${transpose}` : transpose}
                </span>
                <button onClick={() => setTranspose(t => Math.min(12, t + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors active:scale-90">
                  <PlusIcon size={14} />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Control de letra */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Letra</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(s => Math.max(12, s - 2))}
                  className="text-slate-400 hover:text-white transition-colors active:scale-90">
                  <Type size={15} />
                </button>
                <span className="font-mono text-xs text-slate-500 w-7 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(32, s + 2))}
                  className="text-slate-400 hover:text-white transition-colors active:scale-90">
                  <Type size={22} />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Compartir */}
            <button onClick={handleShare}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-90">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Enviar</span>
              <Share2 size={20} />
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

// ─── Panel Admin (Nuevo / Editar) ────────────────────────────────────────────
const AdminPanel = ({ onClose, songToEdit, showToast }) => {
  const [form, setForm] = useState({
    titulo: '', tonoOriginal: 'G', categoria: 'Ordinario', autor: '', cuerpo: ''
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (songToEdit) {
      setForm({
        titulo: songToEdit.titulo || '',
        tonoOriginal: songToEdit.tonoOriginal || songToEdit.tonalidad || 'G',
        categoria: songToEdit.categoria || 'Ordinario',
        autor: songToEdit.autor || '',
        cuerpo: songToEdit.cuerpo || '',
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

      {/* Header */}
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

      {/* Formulario */}
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Título del canto</label>
          <input
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            placeholder="Ej: Pescador de Hombres"
            value={form.titulo}
            onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tono</label>
            <select
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={form.tonoOriginal}
              onChange={e => setForm(f => ({ ...f, tonoOriginal: e.target.value }))}
            >
              {TONOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</label>
            <select
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
            >
              {CATEGORIAS.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Autor / Compositor</label>
          <input
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            placeholder="Opcional"
            value={form.autor}
            onChange={e => setForm(f => ({ ...f, autor: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Letra con acordes</label>
            <button type="button" onClick={insertChord}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              + Insertar [acorde]
            </button>
          </div>
          <textarea
            ref={textareaRef}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[13px] leading-7 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 min-h-[280px]"
            placeholder={`[G]Señor mi [C]Dios, al contemplar los [D]cielos...\n[G]La luna, el [C]sol y las estre[D]llas...\n\nEstribillo:\n[Em]¡Cuán grande es [C]Él! ¡Cuán gran[G]de es Él!`}
            value={form.cuerpo}
            onChange={e => setForm(f => ({ ...f, cuerpo: e.target.value }))}
            required
          />
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Formato: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">[G]</code> antes de la sílaba que lleva el acorde.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !form.titulo.trim() || !form.cuerpo.trim()}
          className="w-full py-5 rounded-3xl font-black text-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed
            bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          {saving ? 'Guardando...' : (songToEdit ? 'Actualizar canto' : 'Publicar canto')}
        </button>
      </form>
    </div>
  );
};

// ─── Lista de Cantos ─────────────────────────────────────────────────────────
const SongList = ({ songs, onSelect }) => {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('Todos');

  const filtered = songs.filter(s => {
    const q = query.toLowerCase();
    const matchQ = !q || s.titulo?.toLowerCase().includes(q) || s.autor?.toLowerCase().includes(q);
    const matchC = cat === 'Todos' || s.categoria === cat;
    return matchQ && matchC;
  });

  const grouped = CATEGORIAS.filter(c => c !== 'Todos').reduce((acc, c) => {
    const items = filtered.filter(s => s.categoria === c);
    if (items.length) acc[c] = items;
    return acc;
  }, {});

  const showGrouped = cat === 'Todos' && !query;

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
        <input
          type="text"
          className="w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-base placeholder:text-slate-400 dark:placeholder:text-slate-600"
          placeholder="Busca por título o autor..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all shrink-0
              ${cat === c
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
              }`}>
            {c}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {showGrouped ? (
        <div className="space-y-7">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <CatBadge cat={category} />
                <span className="text-xs text-slate-400 font-semibold">{items.length} cantos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(song => <SongCard key={song.id} song={song} onSelect={onSelect} />)}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <EmptyState query={query} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(song => <SongCard key={song.id} song={song} onSelect={onSelect} />)}
          {filtered.length === 0 && <div className="col-span-full"><EmptyState query={query} /></div>}
        </div>
      )}
    </div>
  );
};

// ─── Card de canción ─────────────────────────────────────────────────────────
const SongCard = ({ song, onSelect }) => (
  <button onClick={() => onSelect(song)}
    className="group relative w-full text-left p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem]
      hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] transition-all overflow-hidden">
    
    {/* Icono decorativo */}
    <Music className="absolute -bottom-4 -right-4 text-slate-50 dark:text-slate-800/50 group-hover:text-blue-50 dark:group-hover:text-blue-950 transition-colors duration-500 group-hover:scale-110" size={80} />
    
    <div className="relative flex justify-between items-start gap-3">
      <div className="space-y-2 min-w-0">
        <CatBadge cat={song.categoria} small />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {song.titulo}
        </h3>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {(song.tonoOriginal || song.tonalidad) && (
            <span className="flex items-center gap-1">
              <Music2 size={11} /> {song.tonoOriginal || song.tonalidad}
            </span>
          )}
          {song.autor && (
            <span className="truncate">{song.autor}</span>
          )}
        </div>
      </div>
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm">
        <ChevronRight size={17} />
      </div>
    </div>
  </button>
);

// ─── Estado vacío ────────────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
  <div className="py-20 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 mb-4">
      <Search size={28} className="text-slate-300 dark:text-slate-700" />
    </div>
    <p className="font-bold text-slate-400 dark:text-slate-600">
      {query ? `Sin resultados para "${query}"` : 'El cantoral está vacío'}
    </p>
    <p className="text-sm text-slate-300 dark:text-slate-700 mt-1">
      {query ? 'Intenta con otros términos' : 'Agrega el primer canto con el botón +'}
    </p>
  </div>
);

// ─── App Principal ───────────────────────────────────────────────────────────
export default function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  );
  const [toast, setToast] = useState(null);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Firebase: carga en tiempo real
  useEffect(() => {
    const cantosRef = ref(db, 'cantos');
    const unsubscribe = onValue(cantosRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.entries(data)
            .map(([id, val]) => ({ id, ...val }))
            .sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''))
        : [];
      setSongs(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const openEdit = useCallback((song) => {
    setSongToEdit(song);
    setShowAdmin(true);
    setSelectedSong(null);
  }, []);

  const closeAdmin = useCallback(() => {
    setShowAdmin(false);
    setSongToEdit(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Toast */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Panel admin */}
  {showAdmin && (
  <AdminPanel 
    onClose={closeAdmin}
    songToEdit={songToEdit}
    showToast={showToast}  // ← Esto está bien
  />
)}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Music className="text-white" size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div>
              <h1 className="text-[15px] font-black tracking-tight leading-none text-slate-900 dark:text-white">
                CANTORAL <span className="text-blue-600">PARROQUIAL</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-0.5">
                {loading ? 'Cargando...' : `${songs.length} cantos`}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDark(d => !d)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => { setSongToEdit(null); setShowAdmin(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all">
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-7">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
              <Music size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Cargando el cantoral...</p>
          </div>
        ) : selectedSong ? (
          <SongDetail
            song={selectedSong}
            onBack={() => setSelectedSong(null)}
            onEdit={openEdit}
            showToast={showToast}
          />
        ) : (
          <SongList songs={songs} onSelect={setSelectedSong} />
        )}
      </main>

    </div>
  );
}