import React, { useState, useEffect, useRef } from 'react';

const VisualEditor = ({ value, onChange, placeholder }) => {
  const [elementos, setElementos] = useState([]);
  const [palabraSeleccionada, setPalabraSeleccionada] = useState(null);
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [textoPegado, setTextoPegado] = useState('');
  const [mostrarConversor, setMostrarConversor] = useState(false);
  const containerRef = useRef(null);

  // Convierte diferentes formatos de internet al formato [Acorde]
  const convertirFormatoInternet = (texto) => {
    let convertido = texto;
    
    // Formato: "G    Señor"
    convertido = convertido.replace(/^([A-G][#b]?m?)\s+/gm, '[$1]');
    convertido = convertido.replace(/\s+([A-G][#b]?m?)\s+/g, ' [$1]');
    
    // Formato: "G - Señor" o "G: Señor"
    convertido = convertido.replace(/([A-G][#b]?m?)[\s\-:]+([A-Za-záéíóú])/g, '[$1]$2');
    
    // Formato: "(G) Señor" o "{G} Señor"
    convertido = convertido.replace(/[\(\{]([A-G][#b]?m?)[\)\}]\s*/g, '[$1]');
    
    // Formato: "|G| Señor"
    convertido = convertido.replace(/\|([A-G][#b]?m?)\|\s*/g, '[$1]');
    
    return convertido;
  };

  // Procesa el texto inicial
  useEffect(() => {
    if (value) {
      const elementosProcesados = procesarTextoAEstructura(value);
      setElementos(elementosProcesados);
    }
  }, [value]);

  const procesarTextoAEstructura = (texto) => {
    const resultado = [];
    let i = 0;
    let textoActual = '';
    
    while (i < texto.length) {
      if (texto[i] === '[') {
        if (textoActual) {
          resultado.push(...dividirEnPalabras(textoActual));
          textoActual = '';
        }
        const end = texto.indexOf(']', i);
        if (end !== -1) {
          const acorde = texto.substring(i + 1, end);
          resultado.push({ tipo: 'acorde', acorde: acorde, id: Date.now() + Math.random() + i });
          i = end + 1;
        } else {
          textoActual += texto[i];
          i++;
        }
      } else {
        textoActual += texto[i];
        i++;
      }
    }
    if (textoActual) resultado.push(...dividirEnPalabras(textoActual));
    return resultado;
  };

  const dividirEnPalabras = (texto) => {
    const partes = texto.split(/(\s+|\n+)/);
    return partes.map(parte => ({
      tipo: parte.trim() === '' ? 'espacio' : 'palabra',
      texto: parte,
      id: Date.now() + Math.random() + parte
    }));
  };

  const convertirATexto = (elementos) => {
    let texto = '';
    let acordePendiente = null;
    for (const elem of elementos) {
      if (elem.tipo === 'acorde') {
        acordePendiente = elem.acorde;
      } else if (elem.tipo === 'palabra' && elem.texto.trim()) {
        if (acordePendiente) {
          texto += `[${acordePendiente}]${elem.texto}`;
          acordePendiente = null;
        } else {
          texto += elem.texto;
        }
      } else if (elem.tipo === 'espacio') {
        texto += elem.texto;
      }
    }
    return texto;
  };

  const aplicarAcorde = (acorde) => {
    if (palabraSeleccionada === null) return;
    const nuevosElementos = [...elementos];
    let acordeIndex = -1;
    for (let i = palabraSeleccionada - 1; i >= 0; i--) {
      if (nuevosElementos[i].tipo === 'acorde') {
        acordeIndex = i;
        break;
      }
      if (nuevosElementos[i].tipo === 'palabra' && nuevosElementos[i].texto.trim() !== '') break;
    }
    if (acordeIndex !== -1) {
      nuevosElementos[acordeIndex].acorde = acorde;
    } else {
      nuevosElementos.splice(palabraSeleccionada, 0, { tipo: 'acorde', acorde: acorde, id: Date.now() });
    }
    setElementos(nuevosElementos);
    setShowChordPicker(false);
    setPalabraSeleccionada(null);
    onChange(convertirATexto(nuevosElementos));
  };

  const eliminarAcorde = () => {
    if (palabraSeleccionada === null) return;
    const nuevosElementos = [...elementos];
    for (let i = 0; i < nuevosElementos.length; i++) {
      if (nuevosElementos[i].tipo === 'acorde' && nuevosElementos[i + 1] && nuevosElementos[i + 1].id === nuevosElementos[palabraSeleccionada]?.id) {
        nuevosElementos.splice(i, 1);
        break;
      }
    }
    setElementos(nuevosElementos);
    setShowChordPicker(false);
    setPalabraSeleccionada(null);
    onChange(convertirATexto(nuevosElementos));
  };

  const handlePegar = async () => {
    try {
      const texto = await navigator.clipboard.readText();
      setTextoPegado(texto);
      setMostrarConversor(true);
    } catch (err) {
      alert('No se pudo leer el portapapeles');
    }
  };

  const copiarLetra = () => {
    if (value) navigator.clipboard.writeText(value);
  };

  const aplicarConversion = () => {
    const convertido = convertirFormatoInternet(textoPegado);
    const nuevoTexto = value ? value + '\n\n' + convertido : convertido;
    onChange(nuevoTexto);
    setMostrarConversor(false);
    setTextoPegado('');
    setElementos(procesarTextoAEstructura(nuevoTexto));
  };

  const acordesDisponibles = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm'];

  const gruposVisuales = () => {
    const grupos = [];
    for (let i = 0; i < elementos.length; i++) {
      const elem = elementos[i];
      if (elem.tipo === 'acorde') {
        const siguiente = elementos[i + 1];
        if (siguiente && siguiente.tipo === 'palabra') {
          grupos.push({ tipo: 'grupo', acorde: elem.acorde, palabra: siguiente.texto, palabraIndex: i + 1 });
          i++;
        }
      } else if (elem.tipo === 'palabra') {
        grupos.push({ tipo: 'palabra', palabra: elem.texto, index: i });
      } else if (elem.tipo === 'espacio' && elem.texto === '\n') {
        grupos.push({ tipo: 'salto' });
      }
    }
    return grupos;
  };

  return (
    <div className="visual-editor">
      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">📱 Modo fácil: Toca una palabra y luego el acorde</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Los acordes aparecerán automáticamente sobre la palabra seleccionada</p>
      </div>

      <div className="mb-3 flex gap-2">
        <button type="button" onClick={handlePegar} className="flex-1 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition">📋 Pegar desde internet</button>
        <button type="button" onClick={copiarLetra} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:scale-95 transition">📄 Copiar letra</button>
      </div>

      <div className="min-h-[300px] p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-x-auto">
        {gruposVisuales().length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
            <div className="text-center"><p className="text-lg mb-2">✏️</p><p className="text-sm">Toca aquí para comenzar a escribir</p></div>
          </div>
        ) : (
          <div className="leading-loose">
            {gruposVisuales().map((grupo, idx) => {
              if (grupo.tipo === 'salto') return <div key={idx} className="w-full h-4"></div>;
              if (grupo.tipo === 'grupo') return (
                <span key={idx} className="inline-block relative group mx-0.5 my-1">
                  <span className="absolute -top-5 left-0 text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-md whitespace-nowrap cursor-pointer" onClick={() => { setPalabraSeleccionada(grupo.palabraIndex); setShowChordPicker(true); }}>{grupo.acorde} ✎</span>
                  <span className="inline-block px-1 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 cursor-pointer" onClick={() => { setPalabraSeleccionada(grupo.palabraIndex); setShowChordPicker(true); }}>{grupo.palabra}</span>
                </span>
              );
              return <span key={idx} className="inline-block px-1 py-0.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mx-0.5 my-1" onClick={() => { setPalabraSeleccionada(grupo.index); setShowChordPicker(true); }}>{grupo.palabra}</span>;
            })}
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="text-xs text-slate-500 cursor-pointer py-2">🔧 Modo avanzado (escribir con formato [Acorde])</summary>
        <textarea className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sm resize-none" rows="6" placeholder={placeholder} value={value} onChange={(e) => { onChange(e.target.value); setElementos(procesarTextoAEstructura(e.target.value)); }} />
      </details>

      {showChordPicker && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-5 animate-slide-up border-t max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-slate-900 pt-1 pb-2">
            <div><h3 className="font-bold text-lg">Elige un acorde</h3><p className="text-xs text-slate-500">Toca el acorde para asignarlo a la palabra seleccionada</p></div>
            <button onClick={() => setShowChordPicker(false)} className="px-4 py-2 bg-red-100 text-red-600 rounded-xl">Cancelar</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-4 mb-2"><p className="text-xs text-slate-400 mb-2">🎵 Acordes</p><div className="grid grid-cols-4 gap-2">{acordesDisponibles.map(acorde => <button key={acorde} onClick={() => aplicarAcorde(acorde)} className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg active:scale-95 transition">{acorde}</button>)}</div></div>
          </div>
          <button onClick={eliminarAcorde} className="w-full mt-4 py-3 bg-red-100 text-red-600 rounded-xl font-bold active:scale-95 transition">🗑️ Quitar acorde de esta palabra</button>
        </div>
      )}

      {mostrarConversor && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center"><div><h3 className="font-bold text-lg">📋 Convertir formato</h3><p className="text-xs text-slate-500">La app convertirá automáticamente el formato</p></div><button onClick={() => setMostrarConversor(false)} className="text-slate-400 text-xl">✕</button></div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm font-medium mb-2">Texto original (pegado):</p>
              <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">{textoPegado}</pre>
              <p className="text-sm font-medium mt-4 mb-2">Vista previa (convertido):</p>
              <pre className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-mono whitespace-pre-wrap text-blue-800">{convertirFormatoInternet(textoPegado)}</pre>
            </div>
            <div className="p-4 border-t flex gap-3"><button onClick={() => setMostrarConversor(false)} className="flex-1 py-3 rounded-xl border">Cancelar</button><button onClick={aplicarConversion} className="flex-1 py-3 rounded-xl bg-blue-600 text-white">✅ Aplicar conversión</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualEditor;