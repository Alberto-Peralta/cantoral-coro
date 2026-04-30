import React, { useState, useRef } from 'react';
import { X, Camera, FileText, Share2, Copy, Check } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import { transponerAcorde } from '../utils/transposer';

const ShareModal = ({ song, onClose, transpose = 0 }) => {
  const [format, setFormat] = useState('png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  // Función para procesar la letra y generar HTML con acordes arriba
  const procesarLetraConAcordes = (texto) => {
    if (!texto) return '<p class="text-center text-slate-400 italic py-8">Sin letra registrada</p>';
    
    const lineas = texto.split('\n');
    let html = '';
    
    for (const linea of lineas) {
      if (!linea.trim()) {
        html += '<div class="h-4"></div>';
        continue;
      }
      
      // Si no tiene acordes
      if (!linea.includes('[')) {
        html += `<div class="leading-loose text-slate-700 dark:text-slate-300">${escapeHtml(linea)}</div>`;
        continue;
      }
      
      // Procesar línea con acordes
      const partes = [];
      let i = 0;
      let textoPlano = '';
      
      while (i < linea.length) {
        if (linea[i] === '[') {
          const end = linea.indexOf(']', i);
          if (end !== -1) {
            const acorde = linea.substring(i + 1, end);
            const acordeTranspuesto = transponerAcorde(acorde, transpose);
            partes.push({ tipo: 'acorde', contenido: acordeTranspuesto, posicion: textoPlano.length });
            i = end + 1;
          } else {
            textoPlano += linea[i];
            i++;
          }
        } else {
          textoPlano += linea[i];
          i++;
        }
      }
      
      // Generar HTML para esta línea
      html += `<div class="relative my-3" style="min-height: 50px;">`;
      html += `<div class="absolute top-0 left-0 right-0 font-mono text-blue-600 dark:text-blue-400 font-bold" style="font-size: 10px; white-space: pre;">`;
      
      // Posicionar acordes usando espacios
      let ultimaPos = 0;
      for (const parte of partes) {
        if (parte.tipo === 'acorde') {
          const espacios = parte.posicion - ultimaPos;
          html += ' '.repeat(Math.max(0, espacios));
          html += parte.contenido;
          ultimaPos = parte.posicion + parte.contenido.length;
        }
      }
      
      html += `</div>`;
      html += `<div class="pt-5 font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-300" style="font-size: 13px;">${escapeHtml(textoPlano)}</div>`;
      html += `</div>`;
    }
    
    return html;
  };
  
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const letraHtml = procesarLetraConAcordes(song.cuerpo || '');

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              📤 Compartir canto
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {song.titulo}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Vista previa */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-100 dark:bg-slate-800">
          <div 
            ref={previewRef}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden"
            style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}
          >
            {/* Encabezado del canto */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-white text-2xl">🎵</span>
              </div>
              <h4 className="font-black text-xl text-slate-900 dark:text-white">
                {song.titulo}
              </h4>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {song.categoria && (
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                    {song.categoria}
                  </span>
                )}
                {song.tonoOriginal && (
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                    Tono original: {song.tonoOriginal}
                    {transpose !== 0 && ` → ${transponerAcorde(song.tonoOriginal, transpose)}`}
                  </span>
                )}
              </div>
            </div>
            
            {/* Letra formateada con acordes arriba */}
            <div 
              className="p-5 font-mono text-sm"
              dangerouslySetInnerHTML={{ __html: letraHtml }}
            />
            
            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[9px] text-slate-400">
                Cantoral Parroquial • Compartido desde la app
              </p>
            </div>
          </div>
        </div>

        {/* Opciones de formato */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setFormat('png')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                format === 'png' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📷 PNG
            </button>
            <button
              onClick={() => setFormat('jpeg')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                format === 'jpeg' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🖼️ JPEG
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                if (!previewRef.current) return;
                setIsGenerating(true);
                try {
                  const dataUrl = format === 'png' 
                    ? await toPng(previewRef.current, { quality: 1, pixelRatio: 2 })
                    : await toJpeg(previewRef.current, { quality: 0.95, pixelRatio: 2 });
                  const link = document.createElement('a');
                  link.download = `${song.titulo.replace(/[^a-z0-9]/gi, '_')}.${format}`;
                  link.href = dataUrl;
                  link.click();
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error al generar la imagen');
                }
                setIsGenerating(false);
              }}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all disabled:opacity-50"
            >
              <Camera size={16} />
              {isGenerating ? 'Generando...' : `Guardar ${format.toUpperCase()}`}
            </button>
            
            <button
              onClick={async () => {
                if (!previewRef.current) return;
                setIsGenerating(true);
                try {
                  const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 3 });
                  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                  const imgProps = pdf.getImageProperties(dataUrl);
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  pdf.save(`${song.titulo.replace(/[^a-z0-9]/gi, '_')}.pdf`);
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error al generar el PDF');
                }
                setIsGenerating(false);
              }}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all disabled:opacity-50"
            >
              <FileText size={16} />
              Guardar PDF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={async () => {
                if (!previewRef.current) return;
                setIsGenerating(true);
                try {
                  const dataUrl = await toPng(previewRef.current, { quality: 1, pixelRatio: 2 });
                  const blob = await (await fetch(dataUrl)).blob();
                  const file = new File([blob], `${song.titulo}.png`, { type: 'image/png' });
                  if (navigator.share) {
                    await navigator.share({
                      title: song.titulo,
                      text: `Canto litúrgico: ${song.titulo}`,
                      files: [file]
                    });
                  } else {
                    const texto = `🎵 ${song.titulo}\nTono: ${song.tonoOriginal || 'N/A'}\n\n${song.cuerpo?.replace(/\[([^\]]+)\]/g, '$1') || ''}`;
                    await navigator.clipboard.writeText(texto);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error al compartir');
                }
                setIsGenerating(false);
              }}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-50"
            >
              <Share2 size={16} />
              Compartir
            </button>
            
            <button
              onClick={async () => {
                const texto = `🎵 ${song.titulo}\nTono: ${song.tonoOriginal || 'N/A'}\n\n${song.cuerpo?.replace(/\[([^\]]+)\]/g, '$1') || ''}`;
                await navigator.clipboard.writeText(texto);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              Copiar texto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;