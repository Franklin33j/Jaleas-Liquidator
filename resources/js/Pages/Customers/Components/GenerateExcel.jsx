import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function GenerateExcel() {
  const [loading, setLoading] = useState(false);

  const procesarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const bstr = event.target.result;
      
      // 'raw: true' asegura que los valores no se formateen (mantiene texto tal cual)
      const workbook = XLSX.read(bstr, { type: 'binary', raw: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Obtenemos los datos crudos
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });

      let filasCombinadas = [];
      let filaTemporal = null;

      // 1. Lógica de combinación de filas (Iniciando desde Fila 1)
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i];
        
        if (i % 3 === 0) {
          filaTemporal = rowData;
        } 
        else if (i % 3 === 1 && filaTemporal !== null) {
          const filaCombinada = [...filaTemporal, ...rowData];
          filasCombinadas.push(filaCombinada);
          filaTemporal = null;
        }
      }

      // 2. Lógica para eliminar columnas que están vacías en TODAS las filas
      if (filasCombinadas.length > 0) {
        const numColumnas = filasCombinadas[0].length;
        const columnasAKeep = [];

        // Identificamos qué índices de columna tienen al menos un dato
        for (let colIndex = 0; colIndex < numColumnas; colIndex++) {
          const tieneDatos = filasCombinadas.some(fila => 
            fila[colIndex] !== null && 
            fila[colIndex] !== undefined && 
            String(fila[colIndex]).trim() !== ""
          );
          if (tieneDatos) {
            columnasAKeep.push(colIndex);
          }
        }

        // Filtramos las filas para dejar solo las columnas con datos
        filasCombinadas = filasCombinadas.map(fila => 
          columnasAKeep.map(index => fila[index])
        );
      }

      // 3. Crear y descargar el libro de salida
      const newSheet = XLSX.utils.aoa_to_sheet(filasCombinadas);
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Datos Limpios");

      XLSX.writeFile(newWorkbook, "clientes_sin_columnas_vacias.xlsx");
      setCargando(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div style={{
      padding: '40px',
      border: '2px solid #6366f1',
      borderRadius: '20px',
      backgroundColor: '#f8fafc',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '40px auto',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Procesador Inteligente</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '30px' }}>
        Combina filas, mantiene formato original y <strong>elimina columnas vacías</strong>.
      </p>

      <label style={{
        backgroundColor: loading ? '#94a3b8' : '#4f46e5',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '10px',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-block',
        transition: 'all 0.2s'
      }}>
        {loading ? 'LIMPIANDO DATOS...' : 'SUBIR EXCEL'}
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={procesarArchivo} 
          style={{ display: 'none' }}
          disabled={loading}
        />
      </label>

      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
         <div style={{ fontSize: '10px', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>TEXTO PURO</div>
         <div style={{ fontSize: '10px', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '4px' }}>SIN COL VACÍAS</div>
      </div>
    </div>
  );
}