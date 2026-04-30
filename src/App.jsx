import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Plus, Music, ChevronRight, ArrowLeft,
  Minus, Plus as PlusIcon, Type, Sun, Moon, Share2,
  Trash2, Pencil, BookOpen, X, Check, AlertCircle,
  Music2, Bookmark, Download, Grid3X3, List
} from 'lucide-react';
import { db, ref, onValue, push, set } from './firebase';
import { transponerAcorde } from './utils/transposer';

// ─── Constantes ────────────────────────────────────────────────────────────
const TONOS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Imágenes locales — ponlas en public/categorias/
const CAT_META = {
  Entrada: {
    img: '/categorias/entrada.jpg',
    color: 'from-amber-900/40 to-amber-700/20',
    accent: '#f59e0b',
    icon: '🚪',
    desc: 'Cantos de bienvenida'
  },
  Ordinario: {
    img: '/categorias/ordinario.jpg',
    color: 'from-blue-900/40 to-blue-700/20',
    accent: '#3b82f6',
    icon: '✝️',
    desc: 'Kyrie, Gloria, Credo'
  },
  Comunión: {
    img: '/categorias/comunion.jpg',
    color: 'from-violet-900/40 to-violet-700/20',
    accent: '#8b5cf6',
    icon: '🍞',
    desc: 'Eucaristía'
  },
  Ofertorio: {
    img: '/categorias/ofertorio.jpg',
    color: 'from-emerald-900/40 to-emerald-700/20',
    accent: '#10b981',
    icon: '🌾',
    desc: 'Presentación de dones'
  },
  Salida: {
    img: '/categorias/salida.jpg',
    color: 'from-rose-900/40 to-rose-700/20',
    accent: '#f43f5e',
    icon: '✨',
    desc: 'Misión y envío'
  },
  Mariano: {
    img: '/categorias/mariano.jpg',
    color: 'from-sky-900/40 to-sky-700/20',
    accent: '#0ea5e9',
    icon: '🌹',
    desc: 'Cantos a María'
  },
  Navidad: {
    img: '/categorias/navidad.jpg',
    color: 'from-red-900/40 to-red-700/20',
    accent: '#ef4444',
    icon: '⭐',
    desc: 'Tiempo de Navidad'
  },
  Cuaresma: {
    img: '/categorias/cuaresma.jpg',
    color: 'from-purple-900/40 to-purple-700/20',
    accent: '#a855f7',
    icon: '🙏',
    desc: 'Tiempo de penitencia'
  },
  'Semana Santa': {
    img: '/categorias/semana-santa.jpg',
    color: 'from-purple-950/50 to-purple-800/20',
    accent: '#7c3aed',
    icon: '✝️',
    desc: 'Pasión del Señor'
  },
  Pascua: {
    img: '/categorias/pascua.jpg',
    color: 'from-lime-900/40 to-lime-700/20',
    accent: '#84cc16',
    icon: '🕊️',
    desc: 'Resurrección'
  },
  'Cristo Rey': {
    img: '/categorias/cristo-rey.jpg',
    color: 'from-amber-900/40 to-yellow-700/20',
    accent: '#eab308',
    icon: '👑',
    desc: 'Reinado de Cristo'
  },
  'Espíritu Santo': {
    img: '/categorias/espiritu-santo.jpg',
    color: 'from-orange-900/40 to-orange-700/20',
    accent: '#f97316',
    icon: '🔥',
    desc: 'Dones del Espíritu'
  },
  Adoración: {
    img: '/categorias/adoracion.jpg',
    color: 'from-indigo-900/40 to-indigo-700/20',
    accent: '#6366f1',
    icon: '🕯️',
    desc: 'Adoración eucarística'
  },
  Vocacional: {
    img: '/categorias/vocacional.jpg',
    color: 'from-teal-900/40 to-teal-700/20',
    accent: '#14b8a6',
    icon: '⚓',
    desc: 'Llamado y misión'
  },
  Alabanza: {
    img: '/categorias/alabanza.jpg',
    color: 'from-pink-900/40 to-pink-700/20',
    accent: '#ec4899',
    icon: '🎵',
    desc: 'Alabanza y adoración'
  },
  Adviento: {
    img: '/categorias/adviento.jpg',
    color: 'from-violet-900/40 to-violet-700/20',
    accent: '#8b5cf6',
    icon: '🕯️',
    desc: 'Tiempo de espera'
  },
};

const DEFAULT_META = {
  img: '/categorias/default.jpg',
  color: 'from-slate-900/40 to-slate-700/20',
  accent: '#64748b',
  icon: '🎶',
  desc: 'Cantos litúrgicos'
};

const CAT_COLOR = {
  Entrada:         { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
  Ordinario:       { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-300' },
  Comunión:        { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  Ofertorio:       { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  Salida:          { bg: 'bg-rose-100 dark:bg-rose-900/30',     text: 'text-rose-700 dark:text-rose-300' },
  Mariano:         { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-300' },
  Navidad:         { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-300' },
  Cuaresma:        { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  'Semana Santa':  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  Pascua:          { bg: 'bg-lime-100 dark:bg-lime-900/30',     text: 'text-lime-700 dark:text-lime-300' },
  'Cristo Rey':    { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-300' },
  'Espíritu Santo':{ bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  Adoración:       { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  Vocacional:      { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-700 dark:text-teal-300' },
  Alabanza:        { bg: 'bg-pink-100 dark:bg-pink-900/30',     text: 'text-pink-700 dark:text-pink-300' },
  Adviento:        { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
};
const DEFAULT_CAT = { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400' };

// ─── Helpers ────────────────────────────────────────────────────────────────
const CatBadge = ({ cat, small }) => {
  const c = CAT_COLOR[cat] || DEFAULT_CAT;
  return (
    <span className={`inline-block rounded-lg font-bold uppercase tracking-widest ${small ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'} ${c.bg} ${c.text}`}>
      {cat || 'Sin categoría'}
    </span>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold transition-all animate-slide-down
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
};

// ─── PWA Install ────────────────────────────────────────────────────────────
const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShowInstall(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null); setShowInstall(false);
  };
  if (!showInstall) return null;
  return (
    <button onClick={handleInstall} className="fixed bottom-24 right-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all active:scale-95">
      <Download size={18} /> Instalar app
    </button>
  );
};

// ─── Procesar Letra ──────────────────────────────────────────────────────────
// Cada [Acorde] flota encima de su sílaba con position:relative,
// sin desplazar ni romper el texto.
const ProcesarLetra = ({ texto, transporte, fontSize }) => {
  const acordeSize = Math.round(fontSize * 0.72);

  const procesarLinea = (linea, numLinea) => {
    // Separar la línea en partes: texto plano o [Acorde]texto
    const partes = [];
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(linea)) !== null) {
      // Texto antes del acorde
      if (match.index > lastIndex) {
        partes.push({ tipo: 'texto', valor: linea.slice(lastIndex, match.index) });
      }
      // El acorde con el texto que lo sigue (hasta el próximo acorde o fin)
      const acorde = transponerAcorde(match[1], transporte);
      partes.push({ tipo: 'acorde', acorde, valor: '' });
      lastIndex = match.index + match[0].length;
    }
    // Texto restante al final
    if (lastIndex < linea.length) {
      partes.push({ tipo: 'texto', valor: linea.slice(lastIndex) });
    }

    // Si no hay acordes, línea simple
    if (!partes.some(p => p.tipo === 'acorde')) {
      return (
        <div key={numLinea} className="text-slate-700 dark:text-slate-300 leading-loose">
          {linea || '\u00A0'}
        </div>
      );
    }

    // Agrupar: cada acorde se ancla al PRIMER CARÁCTER que le sigue
    // (aunque sea espacio). El resto del texto queda como fragmento libre.
    const grupos = [];
    for (let i = 0; i < partes.length; i++) {
      const p = partes[i];
      if (p.tipo === 'acorde') {
        const siguiente = partes[i + 1];
        if (siguiente?.tipo === 'texto' && siguiente.valor.length > 0) {
          // Anclar al primer carácter, dejar el resto suelto
          const ancla = siguiente.valor[0];
          const resto = siguiente.valor.slice(1);
          grupos.push({ acorde: p.acorde, ancla });
          if (resto) grupos.push({ acorde: null, texto: resto });
          i++; // consumimos el texto siguiente
        } else {
          // No hay texto después: usar espacio no-rompible como ancla
          grupos.push({ acorde: p.acorde, ancla: '\u00A0' });
        }
      } else {
        grupos.push({ acorde: null, texto: p.valor });
      }
    }

    return (
      <div key={numLinea} className="leading-loose" style={{ paddingTop: `${acordeSize + 4}px` }}>
        {grupos.map((g, i) => {
          if (!g.acorde) {
            return (
              <span key={i} className="text-slate-700 dark:text-slate-300">
                {g.texto}
              </span>
            );
          }
          return (
            <span key={i} className="relative inline-block" style={{ paddingTop: `${acordeSize + 2}px`, marginTop: `-${acordeSize + 2}px` }}>
              {/* Acorde flotando encima del primer carácter */}
              <span
                className="absolute left-0 top-0 text-blue-600 dark:text-blue-400 font-black whitespace-nowrap leading-none"
                style={{ fontSize: `${acordeSize}px` }}
              >
                {g.acorde}
              </span>
              {/* Carácter ancla */}
              <span className="text-slate-700 dark:text-slate-300">{g.ancla}</span>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ fontSize: `${fontSize}px` }} className="leading-normal space-y-1">
      {texto.split('\n').map((l, i) => procesarLinea(l, i))}
    </div>
  );
};

// ─── Confirm Modal ───────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 animate-slide-up">
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4"><Trash2 size={22} className="text-red-600 dark:text-red-400" /></div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm">Cancelar</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm">Eliminar</button>
      </div>
    </div>
  </div>
);

// ─── Category Manager ─────────────────────────────────────────────────────────
const CategoryManager = ({ categorias, onAdd, onEdit, onDelete, onClose }) => {
  const [nueva, setNueva] = useState('');
  const [editando, setEditando] = useState(null);
  const [editValue, setEditValue] = useState('');
  return (
    <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div><h3 className="font-bold text-lg">📂 Gestionar Categorías</h3><p className="text-xs text-slate-500">Añade, edita o elimina categorías</p></div>
          <button onClick={onClose} className="text-slate-400 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            {categorias.length === 0 ? (
              <div className="text-center py-8 text-slate-400"><p>No hay categorías</p></div>
            ) : categorias.map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {editando === cat ? (
                  <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border rounded-lg" autoFocus
                    onKeyPress={e => e.key === 'Enter' && onEdit(cat, editValue) && setEditando(null)} />
                ) : <span className="font-medium">{cat}</span>}
                <div className="flex gap-2">
                  {editando === cat ? (
                    <>
                      <button onClick={() => { onEdit(cat, editValue); setEditando(null); }} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">✓</button>
                      <button onClick={() => setEditando(null)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditando(cat); setEditValue(cat); }} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">✏️</button>
                      <button onClick={() => onDelete(cat)} className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm font-medium mb-2">➕ Agregar nueva categoría</p>
            <div className="flex gap-2">
              <input type="text" value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Nombre de la categoría"
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                onKeyPress={e => e.key === 'Enter' && nueva.trim() && onAdd(nueva) && setNueva('')} />
              <button onClick={() => { if (nueva.trim()) onAdd(nueva); setNueva(''); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">Agregar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Song Detail ──────────────────────────────────────────────────────────────
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
    const text = `🎵 ${song.titulo}\nTono: ${song.tonoOriginal || 'N/A'}\n\n${song.cuerpo || ''}`;
    if (navigator.share) await navigator.share({ title: song.titulo, text }).catch(() => {});
    else if (navigator.clipboard) { await navigator.clipboard.writeText(text); showToast('Copiado al portapapeles', 'success'); }
  };
  return (
    <>
      {showConfirm && <ConfirmModal title="¿Eliminar canto?" message={`"${song.titulo}" se eliminará permanentemente.`} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} />}
      <div className="max-w-3xl mx-auto pb-36 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors group">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:-translate-x-1 transition-transform"><ArrowLeft size={18} /></div>
            <span className="text-sm hidden sm:inline">Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(song)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><Pencil size={17} /></button>
            <button onClick={() => setShowConfirm(true)} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all"><Trash2 size={17} /></button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="relative px-7 pt-8 pb-7 border-b border-slate-50 dark:border-slate-800 overflow-hidden">
            <div className="absolute -top-6 -right-6 opacity-[0.04] pointer-events-none"><Music2 size={180} /></div>
            <div className="relative space-y-3">
              <CatBadge cat={song.categoria} />
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{song.titulo}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 dark:text-slate-500">
                {song.autor && <span className="flex items-center gap-1.5 font-medium"><BookOpen size={14} /> {song.autor}</span>}
                {song.tonoOriginal && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 font-bold text-xs">
                    Tono: {song.tonoOriginal}{transpose !== 0 && <span className="text-amber-600 dark:text-amber-400 ml-1">→ {transponerAcorde(song.tonoOriginal, transpose)}</span>}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="px-7 py-8 overflow-x-auto">
            {song.cuerpo
              ? <ProcesarLetra texto={song.cuerpo} transporte={transpose} fontSize={fontSize} />
              : <div className="py-12 text-center text-slate-400"><Music2 size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Sin letra registrada.</p></div>}
          </div>
        </div>
        <div className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-50">
          <div className="bg-slate-950/95 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl border border-white/[0.06]">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Tono</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setTranspose(t => Math.max(-12, t - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors active:scale-90"><Minus size={14} /></button>
                <span className="font-mono font-black text-blue-400 w-8 text-center tabular-nums">{transpose >= 0 ? `+${transpose}` : transpose}</span>
                <button onClick={() => setTranspose(t => Math.min(12, t + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors active:scale-90"><PlusIcon size={14} /></button>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Letra</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="text-slate-400 hover:text-white transition-colors active:scale-90"><Type size={15} /></button>
                <span className="font-mono text-xs text-slate-500 w-7 text-center">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="text-slate-400 hover:text-white transition-colors active:scale-90"><Type size={22} /></button>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <button onClick={handleShare} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-90">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Enviar</span>
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────
const AdminPanel = ({ onClose, songToEdit, showToast, categorias }) => {
  const [form, setForm] = useState({ titulo: '', tonoOriginal: 'G', categoria: '', autor: '', cuerpo: '' });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  useEffect(() => {
    if (songToEdit) setForm({ titulo: songToEdit.titulo || '', tonoOriginal: songToEdit.tonoOriginal || 'G', categoria: songToEdit.categoria || '', autor: songToEdit.autor || '', cuerpo: songToEdit.cuerpo || '' });
    else setForm({ titulo: '', tonoOriginal: 'G', categoria: '', autor: '', cuerpo: '' });
  }, [songToEdit]);
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.cuerpo.trim()) return;
    setSaving(true);
    try {
      const path = songToEdit ? `cantos/${songToEdit.id}` : `cantos/${push(ref(db, 'cantos')).key}`;
      await set(ref(db, path), { ...form, fechaUpdate: Date.now() });
      showToast(songToEdit ? 'Canto actualizado ✓' : 'Canto publicado ✓', 'success');
      onClose();
    } catch { showToast('Error al guardar', 'error'); }
    finally { setSaving(false); }
  };
  const insertChord = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newVal = form.cuerpo.slice(0, start) + '[C]' + form.cuerpo.slice(start);
    setForm(f => ({ ...f, cuerpo: newVal }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 1, start + 2); }, 0);
  };
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-slide-up">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm sticky top-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{songToEdit ? 'Editar canto' : 'Nuevo canto'}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Usa [Acorde] para marcar acordes en la letra</p>
        </div>
        <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"><X size={20} /></button>
      </div>
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título del canto</label>
          <input className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ej: Pescador de Hombres" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tono original</label>
            <select className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-bold outline-none" value={form.tonoOriginal} onChange={e => setForm(f => ({ ...f, tonoOriginal: e.target.value }))}>
              {TONOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
            <select className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base outline-none" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Autor / Compositor</label>
          <input className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Opcional" value={form.autor} onChange={e => setForm(f => ({ ...f, autor: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Letra con acordes</label>
            <button type="button" onClick={insertChord} className="text-xs font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">+ [acorde]</button>
          </div>
          <textarea ref={textareaRef}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-[13px] leading-7 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none min-h-[280px]"
            placeholder={`[G]Señor mi [C]Dios, al contemplar los [D]cielos...`}
            value={form.cuerpo} onChange={e => setForm(f => ({ ...f, cuerpo: e.target.value }))} required />
        </div>
        <button type="submit" disabled={saving || !form.titulo.trim() || !form.cuerpo.trim()}
          className="w-full py-5 rounded-3xl font-black text-lg text-white transition-all disabled:opacity-40 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 active:scale-[0.98]">
          {saving ? 'Guardando...' : (songToEdit ? 'Actualizar canto' : 'Publicar canto')}
        </button>
      </form>
    </div>
  );
};

// ─── Song Card ────────────────────────────────────────────────────────────────
const SongCard = ({ song, onSelect }) => (
  <button onClick={() => onSelect(song)}
    className="group relative w-full text-left p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 active:scale-[0.98] transition-all overflow-hidden">
    <Music className="absolute -bottom-4 -right-4 text-slate-50 dark:text-slate-800/50 group-hover:text-blue-50 dark:group-hover:text-blue-950 transition-colors duration-500" size={80} />
    <div className="relative flex justify-between items-start gap-3">
      <div className="space-y-1.5 min-w-0">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{song.titulo}</h3>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {song.tonoOriginal && <span className="flex items-center gap-1"><Music2 size={11} /> {song.tonoOriginal}</span>}
          {song.autor && <span className="truncate">{song.autor}</span>}
        </div>
      </div>
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm"><ChevronRight size={17} /></div>
    </div>
  </button>
);

// ─── PANTALLA: Lista de cantos de una categoría ───────────────────────────────
const CategorySongList = ({ categoria, songs, onSelect, onBack }) => {
  const [query, setQuery] = useState('');
  const meta = CAT_META[categoria] || DEFAULT_META;
  const filtered = songs.filter(s => {
    const q = query.toLowerCase();
    return !q || s.titulo?.toLowerCase().includes(q) || s.autor?.toLowerCase().includes(q);
  });

  return (
    <div className="animate-fade-in">
      {/* Hero de categoría */}
      <div className="relative -mx-4 md:-mx-8 -mt-7 mb-8 h-44 overflow-hidden">
        <img src={meta.img} alt={categoria} className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.color}`} />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-colors">
            <div className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"><ArrowLeft size={16} /></div>
            <span className="text-xs">Inicio</span>
          </button>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{meta.desc}</p>
              <h2 className="text-3xl font-black text-white tracking-tight">{categoria}</h2>
            </div>
            <div className="text-right">
              <span className="text-4xl">{meta.icon}</span>
              <p className="text-white/70 text-xs font-semibold mt-1">{songs.length} cantos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative group mb-5">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={18} />
        <input type="text"
          className="w-full pl-13 pr-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
          placeholder={`Buscar en ${categoria}...`}
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
      </div>

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(song => <SongCard key={song.id} song={song} onSelect={onSelect} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <p className="font-bold text-slate-400 dark:text-slate-600">{query ? `Sin resultados para "${query}"` : 'Sin cantos en esta categoría'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PANTALLA: Home con grid de categorías ────────────────────────────────────
const CategoryHome = ({ songs, categorias, onSelectCategory, onSelectSong }) => {
  const [query, setQuery] = useState('');

  // Categorías que tienen cantos
  const categoriasConCantos = [...new Set(songs.map(s => s.categoria).filter(Boolean))];
  const todasCategorias = [...new Set([...categorias, ...categoriasConCantos])];

  // Contar cantos por categoría
  const countByCat = {};
  songs.forEach(s => { if (s.categoria) countByCat[s.categoria] = (countByCat[s.categoria] || 0) + 1; });

  // Si hay búsqueda activa, mostrar resultados planos
  const searchResults = query
    ? songs.filter(s => s.titulo?.toLowerCase().includes(query.toLowerCase()) || s.autor?.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Buscador global */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" size={20} />
        <input type="text"
          className="w-full pl-14 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          placeholder="Buscar cualquier canto..."
          value={query} onChange={e => setQuery(e.target.value)} />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={16} /></button>}
      </div>

      {/* Resultados de búsqueda */}
      {query ? (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map(song => <SongCard key={song.id} song={song} onSelect={onSelectSong} />)}
            {searchResults.length === 0 && (
              <div className="col-span-2 py-16 text-center">
                <p className="font-bold text-slate-400 dark:text-slate-600">Sin resultados para "{query}"</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Categorías</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {todasCategorias.filter(cat => countByCat[cat] > 0).map(cat => {
                const meta = CAT_META[cat] || DEFAULT_META;
                const count = countByCat[cat] || 0;
                return (
                  <button key={cat} onClick={() => onSelectCategory(cat)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-lg active:scale-[0.97] transition-all duration-200 bg-slate-100 dark:bg-slate-800">
                    {/* Imagen de fondo */}
                    <img src={meta.img} alt={cat} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {/* Overlay suave solo en la parte inferior para leer el texto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    {/* Contenido */}
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <span className="text-xl leading-none drop-shadow">{meta.icon}</span>
                      </div>
                      <div>
                        <p className="text-white font-black text-sm leading-tight tracking-tight drop-shadow">{cat}</p>
                        <p className="text-white/70 text-[10px] font-semibold mt-0.5">{count} canto{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {/* Borde de acento al hover */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cantos sin categoría */}
          {songs.filter(s => !s.categoria).length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-3">Sin categoría</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {songs.filter(s => !s.categoria).map(song => <SongCard key={song.id} song={song} onSelect={onSelectSong} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── App Principal ────────────────────────────────────────────────────────────
export default function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isDark, setIsDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const [toast, setToast] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'cantos'), (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, val]) => ({ id, ...val })).sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '')) : [];
      setSongs(list);
      setLoading(false);
      setCategorias(prev => {
        const enCantos = [...new Set(list.map(s => s.categoria).filter(Boolean))];
        const nuevas = enCantos.filter(c => !prev.includes(c));
        if (nuevas.length > 0) { const merged = [...prev, ...nuevas]; set(ref(db, 'categorias'), merged); return merged; }
        return prev;
      });
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'categorias'), (snapshot) => {
      const data = snapshot.val();
      if (Array.isArray(data)) setCategorias(data);
      else if (data?.lista && Array.isArray(data.lista)) setCategorias(data.lista);
      else setCategorias([]);
    });
    return () => unsubscribe();
  }, []);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type, key: Date.now() }), []);
  const openEdit = useCallback((song) => { setSongToEdit(song); setShowAdmin(true); setSelectedSong(null); }, []);
  const closeAdmin = useCallback(() => { setShowAdmin(false); setSongToEdit(null); }, []);

  const agregarCategoria = (nueva) => { if (nueva.trim() && !categorias.includes(nueva.trim())) { const n = [...categorias, nueva.trim()]; setCategorias(n); set(ref(db, 'categorias'), n); } };
  const editarCategoria = (vieja, nueva) => {
    if (nueva.trim() && !categorias.includes(nueva.trim())) {
      const idx = categorias.indexOf(vieja);
      if (idx !== -1) { const n = [...categorias]; n[idx] = nueva.trim(); setCategorias(n); set(ref(db, 'categorias'), n); songs.forEach(s => { if (s.categoria === vieja) set(ref(db, `cantos/${s.id}/categoria`), nueva.trim()); }); }
    }
  };
  const eliminarCategoria = (cat) => {
    if (window.confirm(`¿Eliminar categoría "${cat}"?`)) {
      const n = categorias.filter(c => c !== cat); setCategorias(n); set(ref(db, 'categorias'), n);
      songs.forEach(s => { if (s.categoria === cat) set(ref(db, `cantos/${s.id}/categoria`), ''); });
    }
  };

  // Cantos de la categoría seleccionada
  const songsByCategory = selectedCategory ? songs.filter(s => s.categoria === selectedCategory) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showAdmin && <AdminPanel onClose={closeAdmin} songToEdit={songToEdit} showToast={showToast} categorias={categorias} />}
      {showCategoryManager && <CategoryManager categorias={categorias} onAdd={agregarCategoria} onEdit={editarCategoria} onDelete={eliminarCategoria} onClose={() => setShowCategoryManager(false)} />}
      <InstallButton />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => { setSelectedSong(null); setSelectedCategory(null); }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-600/30"><Music className="text-white" size={20} /></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div className="text-left">
              <h1 className="text-[15px] font-black tracking-tight leading-none text-slate-900 dark:text-white">CANTORAL <span className="text-blue-600">PARROQUIAL</span></h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] mt-0.5">{loading ? 'Cargando...' : `${songs.length} cantos`}</p>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDark(d => !d)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setShowCategoryManager(true)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="Gestionar categorías">📂</button>
            <button onClick={() => { setSongToEdit(null); setShowAdmin(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all">
              <Plus size={18} /><span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-7">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse"><Music size={24} className="text-blue-600 dark:text-blue-400" /></div>
            <p className="text-slate-400 text-sm font-medium">Cargando el cantoral...</p>
          </div>
        ) : selectedSong ? (
          <SongDetail song={selectedSong} onBack={() => setSelectedSong(null)} onEdit={openEdit} showToast={showToast} />
        ) : selectedCategory ? (
          <CategorySongList
            categoria={selectedCategory}
            songs={songsByCategory}
            onSelect={setSelectedSong}
            onBack={() => setSelectedCategory(null)}
          />
        ) : (
          <CategoryHome
            songs={songs}
            categorias={categorias}
            onSelectCategory={setSelectedCategory}
            onSelectSong={setSelectedSong}
          />
        )}
      </main>
    </div>
  );
}