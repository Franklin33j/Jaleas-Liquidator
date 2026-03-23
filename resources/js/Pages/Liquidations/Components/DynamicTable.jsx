import React, { useState, useRef } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, X, MinusCircle, Trash2, RotateCcw } from 'lucide-react';

const LiquidacionTable = () => {
    const inputRefs = useRef({});

    // Estados iniciales para el reset
    const initialColumns = [
        { id: 'item', label: 'ITEM', type: 'fixed' },
        { id: 'producto', label: 'PRODUCTO', type: 'fixed' },
        { id: 'inv_ant', label: 'INV. ANT.', type: 'mov', effect: 'add' },
    ];

    const initialRows = [
        { id: 'r1', item: 1, producto: 'PRODUCTO NUEVO', inv_ant: 0, retorno: 0 },
    ];

    const [columns, setColumns] = useState(initialColumns);
    const [rows, setRows] = useState(initialRows);
    const [showMovMenu, setShowMovMenu] = useState(false);
    const [newMovName, setNewMovName] = useState('');

    // --- ACCIÓN DE LIMPIEZA COMPLETA ---
    const clearAll = () => {
        const confirmClear = window.confirm("¿Estás seguro de que deseas limpiar toda la tabla? Se borrarán todos los productos y movimientos.");
        if (confirmClear) {
            setColumns(initialColumns);
            setRows(initialRows);
            inputRefs.current = {};
        }
    };

    // --- GESTIÓN DE COLUMNAS ---
    const addMovement = (effect) => {
        if (!newMovName) return;
        const id = `mov_${Date.now()}`;
        setColumns(prev => [...prev, { id, label: newMovName.toUpperCase(), type: 'mov', effect }]);
        setRows(prev => {
            const newRows = prev.map(r => ({ ...r, [id]: 0 }));
            setTimeout(() => {
                inputRefs.current[newRows[0].id]?.[id]?.focus();
            }, 0);
            return newRows;
        });
        setNewMovName('');
        setShowMovMenu(false);
    };

    const removeColumn = (colId) => {
        if (columns.find(c => c.id === colId).type === 'fixed') return;
        setColumns(columns.filter(c => c.id !== colId));
        setRows(rows.map(r => {
            const newRow = { ...r };
            delete newRow[colId];
            return newRow;
        }));
    };

    // --- GESTIÓN DE FILAS ---
    const addProduct = () => {
        const newRow = { id: Date.now(), item: rows.length + 1, producto: '', retorno: 0 };
        columns.forEach(col => { if (col.type === 'mov') newRow[col.id] = 0; });
        setRows(prev => {
            const updated = [...prev, newRow];
            setTimeout(() => { inputRefs.current[newRow.id]?.['producto']?.focus(); }, 0);
            return updated;
        });
    };

    const removeRow = (id) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id).map((r, i) => ({ ...r, item: i + 1 })));
        }
    };

    // --- CÁLCULOS ---
    const calculateTotal = (row) => {
        return columns
            .filter(col => col.type === 'mov')
            .reduce((sum, col) => {
                const val = Number(row[col.id]) || 0;
                return col.effect === 'add' ? sum + val : sum - val;
            }, 0);
    };

    const calculateVentas = (row) => calculateTotal(row) - (Number(row.retorno) || 0);

    const getTotal = (colId) => {
        if (colId === 'total_inv') return rows.reduce((sum, r) => sum + calculateTotal(r), 0);
        if (colId === 'ventas') return rows.reduce((sum, r) => sum + calculateVentas(r), 0);
        return rows.reduce((sum, r) => sum + (Number(r[colId]) || 0), 0);
    };

    return (
        <div className="w-full p-4 bg-white min-h-screen font-sans text-slate-500">
            <div className="max-w-full mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-sm font-bold text-slate-800 tracking-tight">Jaleas del Pino</h1>
                            <p className="text-[9px] uppercase tracking-widest text-slate-400">Liquidación Diaria</p>
                        </div>
                        <button 
                            onClick={clearAll}
                            className="flex items-center gap-1 text-[9px] font-bold text-rose-400 hover:text-rose-600 transition-colors uppercase border border-rose-100 px-2 py-1 rounded bg-rose-50/30"
                        >
                            <RotateCcw size={10} /> Reiniciar Tabla
                        </button>
                    </div>

                    <div className="flex gap-2 text-right">
                        <div className="relative">
                            <button
                                onClick={() => setShowMovMenu(!showMovMenu)}
                                className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-600 flex items-center gap-1 hover:bg-slate-100"
                            >
                                <Plus size={12} /> MOVIMIENTO
                            </button>

                            {showMovMenu && (
                                <div className="absolute right-0 mt-1 w-48 bg-white border shadow-lg rounded p-3 z-50">
                                    <input
                                        className="w-full p-1.5 text-[10px] mb-2 border rounded focus:outline-slate-400 focus:border-slate-400"
                                        placeholder="Nombre..."
                                        value={newMovName}
                                        onChange={e => setNewMovName(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex gap-1">
                                        <button onClick={() => addMovement('add')} className="flex-1 py-1.5 bg-blue-50 text-blue-500 rounded text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-blue-100">
                                            <ArrowUpRight size={10} /> Traslado
                                        </button>
                                        <button onClick={() => addMovement('sub')} className="flex-1 py-1.5 bg-rose-50 text-rose-500 rounded text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-rose-100">
                                            <ArrowDownLeft size={10} /> Devolucion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={addProduct}
                            className="text-[10px] font-bold px-3 py-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center gap-1"
                        >
                            <Plus size={12} /> PRODUCTO
                        </button>
                    </div>
                </div>

                {/* TABLA */}
                <div className="border border-slate-200 rounded overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {columns.map(col => (
                                    <th key={col.id} className="relative p-2 text-[9px] text-center border-r border-slate-200 font-bold text-slate-400 tracking-tighter uppercase group">
                                        {col.label}
                                        {col.type !== 'fixed' && col.id !== 'inv_ant' && (
                                            <button
                                                onClick={() => removeColumn(col.id)}
                                                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={8} />
                                            </button>
                                        )}
                                    </th>
                                ))}
                                <th className="p-2 text-[9px] bg-slate-100 text-slate-600 border-r border-slate-200 font-bold">TOTAL</th>
                                <th className="p-2 text-[9px] text-slate-400 border-r border-slate-200 font-bold">RETORNO</th>
                                <th className="p-2 text-[9px] bg-emerald-50 text-emerald-600 font-bold">VENTAS</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>

                        <tbody className="text-[11px]">
                            {rows.map(row => (
                                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 group">
                                    {columns.map(col => (
                                        <td key={col.id} className="border-r border-slate-100">
                                            {col.id === 'item' ? (
                                                <div className="text-center text-slate-300">{row.item}</div>
                                            ) : (
                                                <input
                                                    ref={(el) => {
                                                        if (!inputRefs.current[row.id]) inputRefs.current[row.id] = {};
                                                        inputRefs.current[row.id][col.id] = el;
                                                    }}
                                                    className={`w-full p-1.5 text-center bg-transparent focus:bg-white outline-none transition-colors ${col.id === 'producto' ? 'text-left px-3 uppercase font-medium text-slate-700 min-w-[180px]' : ''} ${col.effect === 'sub' ? 'text-rose-400 font-medium' : ''}`}
                                                    value={row[col.id]}
                                                    placeholder="0"
                                                    onChange={e =>
                                                        setRows(rows.map(r => r.id === row.id ? { ...r, [col.id]: e.target.value } : r))
                                                    }
                                                />
                                            )}
                                        </td>
                                    ))}
                                    <td className="text-center font-bold text-slate-700 bg-slate-50/50 text-[10px]">
                                        {calculateTotal(row)}
                                    </td>
                                    <td className="p-0 border-r border-slate-100">
                                        <input
                                            className="w-full p-1.5 text-center bg-transparent focus:bg-white outline-none font-medium text-amber-600"
                                            value={row.retorno}
                                            onChange={e =>
                                                setRows(rows.map(r => r.id === row.id ? { ...r, retorno: e.target.value } : r))
                                            }
                                        />
                                    </td>
                                    <td className="text-center font-bold text-emerald-600 bg-emerald-50/20 text-[12px]">
                                        {calculateVentas(row)}
                                    </td>
                                    <td className="text-center">
                                        <button 
                                            onClick={() => removeRow(row.id)}
                                            className="text-slate-200 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <MinusCircle size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Totales */}
                            <tr className="bg-slate-50/80 font-bold border-t border-slate-200">
                                <td colSpan={2} className="p-3 text-right text-[9px] uppercase tracking-widest text-slate-400">Totales Finales</td>
                                {columns.slice(2).map(col => (
                                    <td key={col.id} className={`text-center p-2 text-[10px] ${col.effect === 'sub' ? 'text-rose-400' : 'text-slate-600'}`}>
                                        {getTotal(col.id)}
                                    </td>
                                ))}
                                <td className="text-center p-2 bg-slate-100 text-slate-800 text-[11px] border-r border-slate-200">{getTotal('total_inv')}</td>
                                <td className="text-center p-2 text-amber-700 border-r border-slate-200">{getTotal('retorno')}</td>
                                <td className="text-center p-2 bg-emerald-100/50 text-emerald-700 text-[13px]">{getTotal('ventas')}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LiquidacionTable;