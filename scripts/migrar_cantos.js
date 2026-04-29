import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAe3452QDD533IatbVVhAuhdlyFGuDQ4Fk",
  authDomain: "notebookcoro.firebaseapp.com",
  databaseURL: "https://notebookcoro-default-rtdb.firebaseio.com",
  projectId: "notebookcoro",
  storageBucket: "notebookcoro.firebasestorage.app",
  messagingSenderId: "210497174745",
  appId: "1:210497174745:web:2a36f91664b3939a8492c8",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Leer el archivo extraído
const texto = fs.readFileSync('cantoral.txt', 'utf-8');

// Función para parsear el cancionero
function parsearCancionero(texto) {
  const lineas = texto.split('\n');
  const canciones = [];
  let cancionActual = null;
  let categoriaActual = '';
  
  // Mapeo de categorías (puedes ajustarlo)
  const mapCategoria = {
    'Entrada': 'Entrada',
    'Ofertorio': 'Ofertorio',
    'Comunión': 'Comunión',
    'Santo': 'Santo',
    'Cordero': 'Cordero',
    'Salida': 'Salida',
    'Marianos': 'Mariano',
    'Navidad': 'Navidad',
    'Cuaresma': 'Cuaresma',
    'Semana Santa': 'Semana Santa',
    'Pascua': 'Pascua',
    'Cristo rey': 'Cristo Rey',
    'Espíritu santo': 'Espíritu Santo',
    'Adoración y santísimo': 'Adoración',
    'Vocacionales': 'Vocacional',
    'Alabanzas': 'Alabanza',
    'Adviento': 'Adviento'
  };
  
  for (let i = 0; i < lineas.length; i++) {
    let linea = lineas[i].trim();
    
    // Detectar título de canción (patrón: "NÚMERO.- TÍTULO")
    const matchTitulo = linea.match(/^(\d+)\.-\s+(.+)$/);
    if (matchTitulo) {
      // Guardar canción anterior
      if (cancionActual && cancionActual.cuerpo) {
        canciones.push(cancionActual);
      }
      
      // Iniciar nueva canción
      cancionActual = {
        titulo: matchTitulo[2].trim(),
        tonoOriginal: 'C', // Por defecto, se puede ajustar después
        categoria: categoriaActual,
        cuerpo: '',
        autor: '',
        numero: matchTitulo[1]
      };
      continue;
    }
    
    // Detectar cambios de categoría
    const matchCategoria = linea.match(/^([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)$/);
    if (matchCategoria && matchCategoria[1].length < 30 && matchCategoria[1].length > 3) {
      const posibleCat = matchCategoria[1].trim();
      if (mapCategoria[posibleCat]) {
        categoriaActual = mapCategoria[posibleCat];
      }
    }
    
    // Agregar letra a la canción actual
    if (cancionActual) {
      // Detectar acordes en formato [G] o G (sin corchetes)
      let lineaProcesada = linea;
      
      // Convertir "G Señor" a "[G]Señor"
      lineaProcesada = lineaProcesada.replace(/([A-G][#b]?m?)\s+([A-Za-záéíóú])/g, '[$1]$2');
      
      cancionActual.cuerpo += (cancionActual.cuerpo ? '\n' : '') + lineaProcesada;
    }
  }
  
  // Última canción
  if (cancionActual && cancionActual.cuerpo) {
    canciones.push(cancionActual);
  }
  
  return canciones;
}

// Subir canciones a Firebase
async function subirCanciones(canciones) {
  console.log(`📚 Se encontraron ${canciones.length} canciones`);
  
  for (let i = 0; i < canciones.length; i++) {
    const cancion = canciones[i];
    const nuevoRef = push(ref(db, 'cantos'));
    
    await set(nuevoRef, {
      titulo: cancion.titulo,
      tonoOriginal: cancion.tonoOriginal,
      categoria: cancion.categoria || 'General',
      cuerpo: cancion.cuerpo,
      autor: '',
      fechaUpdate: Date.now()
    });
    
    console.log(`✅ ${i + 1}/${canciones.length}: ${cancion.titulo}`);
    
    // Pequeña pausa para no saturar Firebase
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('🎉 ¡Migración completada!');
}

// Ejecutar
const canciones = parsearCancionero(texto);
subirCanciones(canciones).catch(console.error);