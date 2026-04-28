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