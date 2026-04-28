#!/bin/bash

OUTPUT="proyecto_llm.txt"

echo "Generando archivo para LLM..."

# Limpiar archivo previo
> $OUTPUT

# 1. Estructura del proyecto
echo "===== ESTRUCTURA DEL PROYECTO =====" >> $OUTPUT
if command -v tree &> /dev/null
then
    tree -I "node_modules|.git|dist|build" >> $OUTPUT
else
    echo "(tree no instalado, usando find)" >> $OUTPUT
    find . -type d -not -path "*/node_modules/*" >> $OUTPUT
fi

# 2. package.json (clave para React)
if [ -f package.json ]; then
    echo -e "\n\n===== package.json =====" >> $OUTPUT
    cat package.json >> $OUTPUT
fi

# 3. Archivos de código importantes
echo -e "\n\n===== ARCHIVOS DE CÓDIGO =====" >> $OUTPUT

find . \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.css" \) \
-not -path "*/node_modules/*" \
-not -path "*/.git/*" \
-not -path "*/dist/*" \
-not -path "*/build/*" \
| while read file; do
    echo -e "\n\n===== $file =====" >> $OUTPUT
    cat "$file" >> $OUTPUT
done

echo "Archivo generado: $OUTPUT"
