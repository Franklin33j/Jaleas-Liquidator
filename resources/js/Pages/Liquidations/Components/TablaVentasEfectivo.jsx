import React, { useState, useRef } from 'react';
import { Plus, X, MinusCircle, RotateCcw, DollarSign, FileText } from 'lucide-react';

const TablaVentasEfectivo = () => {
    const inputRefs = useRef({});

    // Columnas basadas en tu segunda imagen
    const initialColumns = [
        { id: 'item', label: 'ITEM', type: 'fixed' },
        { id: 'cliente', label: 'CLIENTE', type: 'editable' },
        { id: 'tot_prod', label: 'TOT PROD XFACT', type: 'editable' },
        { id: 'n_factura', label: '# FACTURA', type: 'editable' },
        { id: 'contado', label: 'CONTADO', type: 'currency' },
        { id: 'credito', label: 'CREDITO', type: 'currency' },
        { id: 'cobro', label: 'COBRO', type: 'currency' },
        { id: 'n_recibo', label: '# RECIBO', type: 'editable' },
        { id: 'n_fac_abonar', label: '# FAC.ABONAR', type: 'editable' },
    ];

    const initialRows = [
        { id: 'v1', item: 1, cliente: '', tot_prod: '', n_factura: '', contado: 0, credito: 0, cobro: 0, n_recibo: '', n_fac_abonar: '' },
    ];

    const [rows, setRows] = useState(initialRows);

    // --- CÁLCULOS ---
    const calculateTotalEfectivo = (row) => {
        return (Number(row.contado) || 0) + (Number(row.cobro) || 0);
    };

    const getTotalColumn = (colId) => {
        if (colId === 'total_efectivo') {
            return rows.reduce((sum, r) => sum + calculateTotalEfectivo(r), 0);
        }
        return rows.reduce((sum, r) => sum + (Number(r[colId]) || 0), 0);
    };

    // --- ACCIONES ---
    const addRow = () => {
        const newRow = { 
            id: Date.now(), 
            item: rows.length + 1, 
            cliente: '', tot_prod: '', n_factura: '', 
            contado: 0, credito: 0, cobro: 0, n_recibo: '', n_fac_abonar: '' 
        };
        setRows([...rows, newRow]);
        setTimeout(() => { inputRefs.current[newRow.id]?.['cliente']?.focus(); }, 0);
    };

    const clearTable = () => {
        if (window.confirm("¿Limpiar todos los registros de ventas?")) {
            setRows(initialRows);
        }
    };

    return (
        <div className="w-full p-4 bg-white min-h-screen font-sans text-slate-500">
            <div className="max-w-full mx-auto">
                
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Control de Ventas y Cobros</h1>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-medium">Detalle de Facturación Diaria</p>
                        </div>
                        <button onClick={clearTable} className="flex items-center gap-1 text-[9px] font-bold text-rose-400 hover:text-rose-600 transition-colors uppercase border border-rose-100 px-2 py-1 rounded bg-rose-50/30">
                            <RotateCcw size={10} /> Limpiar Todo
                        </button>
                    </div>

                    <button onClick={addRow} className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-all">
                        <Plus size={12} /> AGREGAR CLIENTE
                    </button>
                </div>

                {/* TABLA BASADA EN IMAGEN 2 */}
                <div className="border border-slate-200 rounded overflow-hidden shadow-sm">
                    <table className="w-full border-collapse bg-white">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                {initialColumns.map(col => (
                                    <th key={col.id} className="p-2 border-r border-slate-200 text-center">
                                        {col.label}
                                    </th>
                                ))}
                                <th className="p-2 bg-emerald-50 text-emerald-700 font-bold">TOTAL EFECTIVO</th>
                                <th className="w-8 bg-white"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[10px]">
                            {rows.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/30 group transition-colors">
                                    {initialColumns.map(col => (
                                        <td key={col.id} className={`p-0 border-r border-slate-100 ${col.id === 'item' ? 'bg-slate-50/50' : ''}`}>
                                            {col.id === 'item' ? (
                                                <div className="text-center text-slate-300 py-2">{row.item}</div>
                                            ) : (
                                                <input 
                                                    ref={(el) => {
                                                        if (!inputRefs.current[row.id]) inputRefs.current[row.id] = {};
                                                        inputRefs.current[row.id][col.id] = el;
                                                    }}
                                                    className={`w-full p-2 outline-none text-center bg-transparent focus:bg-white ${col.id === 'cliente' ? 'text-left px-3 font-semibold text-slate-700 min-w-[150px] uppercase' : ''} ${col.type === 'currency' ? 'text-blue-600 font-medium' : ''}`}
                                                    value={row[col.id]}
                                                    placeholder={col.type === 'currency' ? "0.00" : "-"}
                                                    onChange={e => setRows(rows.map(r => r.id === row.id ? {...r, [col.id]: e.target.value} : r))}
                                                />
                                            )}
                                        </td>
                                    ))}
                                    {/* Total Efectivo: Contado + Cobro */}
                                    <td className="text-center font-bold text-emerald-600 bg-emerald-50/10 text-[11px]">
                                        $ {calculateTotalEfectivo(row).toFixed(2)}
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                                            <MinusCircle size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* FILA DE TOTALES (AMARILLA COMO EN TU IMAGEN) */}
                            <tr className="bg-yellow-300/90 font-bold border-t-2 border-slate-800 text-slate-800">
                                <td colSpan={2} className="p-2 text-right text-[9px] uppercase tracking-widest px-4">Totales del Día</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">{getTotalColumn('tot_prod')}</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">-</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">$ {getTotalColumn('contado').toFixed(2)}</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">$ {getTotalColumn('credito').toFixed(2)}</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">$ {getTotalColumn('cobro').toFixed(2)}</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">-</td>
                                <td className="text-center p-2 border-r border-yellow-400/50">-</td>
                                <td className="text-center p-2 bg-emerald-700 text-white text-[12px]">$ {getTotalColumn('total_efectivo').toFixed(2)}</td>
                                <td className="bg-white"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex justify-between text-[8px] text-slate-400 uppercase tracking-tighter italic px-2">
                    <span>* Total Efectivo = Contado + Cobro</span>
                    <span>Formato Oficial de Liquidación</span>
                </div>
            </div>
        </div>
    );
};

export default TablaVentasEfectivo;