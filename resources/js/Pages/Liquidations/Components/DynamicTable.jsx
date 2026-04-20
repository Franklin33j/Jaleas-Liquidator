import React, { useState, useRef, useEffect, useContext } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, X, MinusCircle, RotateCcw, Save, FolderOpen } from 'lucide-react';
import ProductModal from './ProductModal';
import LiquidationContext from '../State/LiquidationContext';

const LiquidacionTable = () => {

    const inputRefs = useRef({});
    const { openProductModal, selectedRowId } = useContext(LiquidationContext)

    const initialColumns = [
        { id: 'item', label: 'ITEM', type: 'fixed' },
        { id: 'producto', label: 'PRODUCTO', type: 'fixed' },
        { id: 'inv_ant', label: 'INVENT. ANT.', type: 'mov', effect: 'add' },
    ];

    const [columns, setColumns] = useState(initialColumns);
    const [rows, setRows] = useState([]);

    const [showMovMenu, setShowMovMenu] = useState(false);
    const [newMovName, setNewMovName] = useState('');

    const [liquidationName, setLiquidationName] = useState('');
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadDialog, setShowLoadDialog] = useState(false);
    const [savedLiquidations, setSavedLiquidations] = useState([]);

    // -------- LIMPIAR --------
    const clearAll = () => {
        if (window.confirm("¿Limpiar tabla?")) {
            setColumns(initialColumns);
            setRows([]);
        }
    };

    // -------- PRODUCTO --------
    const handleSelectProduct = (product) => {
        setRows(rows.map(r =>
            r.id === selectedRowId
                ? { ...r, producto: product.name, productId: product.id }
                : r
        ));
    };

    // -------- MOVIMIENTOS --------
    const addMovement = (effect) => {
        if (!newMovName.trim()) return;

        const id = `mov_${Date.now()}`;

        const newColumn = {
            id,
            label: effect == 'add' ? 'CARGA ' + newMovName.toUpperCase() : 'DEVOLUCION ' + newMovName.toUpperCase(),
            type: 'mov',
            effect
        };

        setColumns(prev => [...prev, newColumn]);

        setRows(prev =>
            prev.map(r => ({ ...r, [id]: 0 }))
        );

        setNewMovName('');
        setShowMovMenu(false);
    };

    const removeColumn = (colId) => {
        if (columns.find(c => c.id === colId)?.type === 'fixed') return;

        setColumns(columns.filter(c => c.id !== colId));

        setRows(rows.map(r => {
            const newRow = { ...r };
            delete newRow[colId];
            return newRow;
        }));
    };

    // -------- FILAS --------
    const addProduct = () => {
        const newRow = {
            id: Date.now(),
            item: rows.length + 1,
            producto: '',
            retorno: 0
        };

        columns.forEach(col => {
            if (col.type === 'mov') newRow[col.id] = 0;
        });

        setRows(prev => [...prev, newRow]);
    };

    const removeRow = (id) => {
        setRows(rows
            .filter(r => r.id !== id)
            .map((r, i) => ({ ...r, item: i + 1 }))
        );
    };

    // -------- CALCULOS --------
    const calculateTotal = (row) => {
        return columns
            .filter(col => col.type === 'mov')
            .reduce((sum, col) => {
                const val = Number(row[col.id]) || 0;
                return col.effect === 'add' ? sum + val : sum - val;
            }, 0);
    };

    const calculateVentas = (row) => {
        return calculateTotal(row) - (Number(row.retorno) || 0);
    };

    const getTotal = (colId) => {
        return rows.reduce((sum, r) => sum + (Number(r[colId]) || 0), 0);
    };

    const totalVentasGeneral = () => {
        return rows.reduce((sum, r) => sum + calculateVentas(r), 0);
    };

    // -------- TAB / ENTER --------
    const handleKeyDown = (e, rowIndex, colIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextRow = rows[rowIndex + 1];
            if (nextRow) {
                const nextCol = columns[colIndex]?.id;
                inputRefs.current[nextRow.id]?.[nextCol]?.focus();
            }
        }
    };

    useEffect(() => {
        const productosSeleccionados = rows.filter(r => r.producto).map(r => {
            const movimientos = columns
                .filter(col => col.type === 'mov')
                .map(col => ({
                    nombre: col.label,
                    tipo: col.effect === 'add' ? 'entrada' : 'salida',
                    valor: Number(r[col.id]) || 0
                }));

            return {
                item: r.item,
                productId: r.productId,
                producto: r.producto,
                inventarioAnterior: Number(r.inv_ant) || 0,
                retorno: Number(r.retorno) || 0,
                movimientos: movimientos,
                totalMovimientos: calculateTotal(r),
                ventas: calculateVentas(r)
            };
        });
        console.log('Productos seleccionados:', productosSeleccionados);
    }, [rows, columns])

    return (
        <div className="w-full p-4 bg-white">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <button onClick={clearAll} className="text-xs text-red-500">
                    <RotateCcw size={14} /> Reiniciar
                </button>

                <div className="flex gap-2">

                    {/* MOVIMIENTO */}
                    <div className="relative">
                        <button onClick={() => setShowMovMenu(!showMovMenu)} className="text-xs border px-2 py-1 flex gap-1">
                            <Plus size={12} /> Movimiento
                        </button>

                        {showMovMenu && (
                            <div className="absolute right-0 bg-white border p-2 w-44 z-50">
                                <input
                                    className="w-full border p-1 text-xs mb-2"
                                    placeholder="Nombre"
                                    value={newMovName}
                                    onChange={e => setNewMovName(e.target.value)}
                                />

                                <div className="flex gap-1">
                                    <button onClick={() => addMovement('add')} className="flex-1 text-xs bg-blue-100">
                                        +
                                    </button>
                                    <button onClick={() => addMovement('sub')} className="flex-1 text-xs bg-red-100">
                                        -
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={addProduct} className="text-xs bg-black text-white px-2 py-1">
                        + Producto
                    </button>
                </div>
            </div>
            {/* TABLA */}
            <table className="w-full border">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.id} className="border text-xs">
                                {col.label}
                            </th>
                        ))}
                        <th>Total</th>
                        <th>Retorno</th>
                        <th>Ventas</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={row.id}>
                            {columns.map((col, colIndex) => (
                                <td key={col.id} className="border">
                                    {col.id === 'item' ? (
                                        row.item
                                    ) : col.id === 'producto' ? (
                                        <input
                                            className="w-[220px] p-1 cursor-pointer"
                                            value={row.producto}
                                            readOnly
                                            onClick={() => openProductModal(row.id)}
                                        />
                                    ) : (
                                        <input
                                            ref={(el) => {
                                                if (!inputRefs.current[row.id]) inputRefs.current[row.id] = {};
                                                inputRefs.current[row.id][col.id] = el;
                                            }}
                                            className="w-full p-1 text-center"
                                            value={row[col.id]}
                                            onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                                            onChange={e =>
                                                setRows(rows.map(r =>
                                                    r.id === row.id
                                                        ? { ...r, [col.id]: e.target.value }
                                                        : r
                                                ))
                                            }
                                        />
                                    )}

                                </td>
                            ))}
                            <td>{calculateTotal(row)}</td>
                            <td>
                                <input
                                    className="w-full text-center"
                                    value={row.retorno}
                                    onChange={e =>
                                        setRows(rows.map(r =>
                                            r.id === row.id
                                                ? { ...r, retorno: e.target.value }
                                                : r
                                        ))
                                    }
                                />
                            </td>
                            <td className="font-bold text-green-600">
                                {calculateVentas(row)}
                            </td>
                            <td>
                                <button onClick={() => removeRow(row.id)}>
                                    <MinusCircle size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {/* 🔥 TOTALES */}
                    {rows.length > 0 && (
                        <tr className="bg-gray-100 font-bold">
                            <td colSpan={2}>Totales</td>
                            {columns.slice(2).map(col => (
                                <td key={col.id}>{getTotal(col.id)}</td>
                            ))}
                            <td></td>
                            <td>{getTotal('retorno')}</td>
                            <td className="text-green-700 text-lg">
                                {totalVentasGeneral()}
                            </td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* MODAL */}
            <ProductModal
                onSelect={handleSelectProduct}
            />
        </div>
    );
};
export default LiquidacionTable;