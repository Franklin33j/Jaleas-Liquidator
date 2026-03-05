import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Copy, Check, Receipt, Eraser, Combine, ListChecks, Tag } from 'lucide-react';

const IvaTable = () => {
    // --- ESTADOS ---
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [counter, setCounter] = useState(1);
    const [globalDiscount, setGlobalDiscount] = useState('');
    const [form, setForm] = useState({ qty: '', netPrice: '' });
    const [copiedId, setCopiedId] = useState(null);

    const discountRef = useRef(null);
    const qtyInputRef = useRef(null);
    const IVA_RATE = 0.13;

    // --- EFECTOS ---
    useEffect(() => {
        discountRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') clearAll();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // --- FUNCIONES DE ACCIÓN ---
    const handleAddProduct = (e) => {
        e.preventDefault();
        const qtyNum = parseFloat(form.qty);
        const netNum = parseFloat(form.netPrice);

        if (isNaN(qtyNum) || qtyNum <= 0 || isNaN(netNum) || netNum <= 0) return;

        const newProduct = {
            id: Date.now(),
            description: `Producto ${counter}`,
            qty: qtyNum,
            netPriceOriginal: netNum,
        };

        setProducts([newProduct, ...products]);
        setCounter(prev => prev + 1);
        setForm({ qty: '', netPrice: '' });
        setTimeout(() => qtyInputRef.current?.focus(), 0);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) 
            ? prev.filter(item => item !== id) 
            : [...prev, id]
        );
    };

    const removeRow = (id) => {
        setProducts(products.filter(p => p.id !== id));
        setSelectedIds(selectedIds.filter(sid => sid !== id));
    };

    const clearAll = () => {
        setProducts([]);
        setCounter(1);
        setSelectedIds([]);
        setGlobalDiscount('');
        setForm({ qty: '', netPrice: '' });
        setTimeout(() => discountRef.current?.focus(), 0);
    };

    const combineSelected = () => {
        if (selectedIds.length < 2) return;
        const toCombine = products.filter(p => selectedIds.includes(p.id));
        const remaining = products.filter(p => !selectedIds.includes(p.id));

        const mergedQty = toCombine.reduce((acc, curr) => acc + curr.qty, 0);
        const mergedNetOriginal = toCombine.reduce((acc, curr) => acc + curr.netPriceOriginal, 0);

        const combinedProduct = {
            id: Date.now(),
            description: `Combinado (${toCombine.length} ítems)`,
            qty: mergedQty,
            netPriceOriginal: mergedNetOriginal,
        };

        setProducts([combinedProduct, ...remaining]);
        setSelectedIds([]);
    };

    const copyToClipboard = (value, type, id, decimals = 4) => {
        const formatted = Number(value).toFixed(decimals);
        navigator.clipboard.writeText(formatted);
        setCopiedId(`${type}-${id}`);
        setTimeout(() => setCopiedId(null), 1000);
    };

    // --- LÓGICA DE CÁLCULO ---
    const discountTotal = parseFloat(globalDiscount) || 0;
    const discountPerRow = products.length > 0 ? discountTotal / products.length : 0;

    const processedProducts = products.map(p => {
        const rowNetWithDiscount = p.netPriceOriginal - discountPerRow;
        const unitNetWithDiscount = rowNetWithDiscount / p.qty;
        const unitWithIva = unitNetWithDiscount * (1 + IVA_RATE);
        const rowTotalWithIva = rowNetWithDiscount * (1 + IVA_RATE);

        return {
            ...p,
            unitNetWithDiscount,
            unitWithIva,
            rowNetWithDiscount,
            rowTotalWithIva
        };
    });

    const finalTotalIva = processedProducts.reduce((acc, curr) => acc + curr.rowTotalWithIva, 0);
    const finalTotalNetoOriginal = processedProducts.reduce((acc, curr) => acc + curr.netPriceOriginal, 0);

    return (
        <div className="max-w-[1400px] mx-auto p-3 font-sans bg-gray-100 min-h-screen text-[11px]">
            
            {/* PANEL SUPERIOR */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-3">
                <div className="bg-white p-2 rounded-lg border-2 border-indigo-500 flex items-center gap-3 shadow-sm">
                    <Tag size={20} className="text-indigo-600" />
                    <div className="flex-1">
                        <label className="block text-[9px] font-black text-indigo-600 uppercase">Ajuste Neto Total</label>
                        <input
                            ref={discountRef}
                            type="number"
                            step="0.01"
                            value={globalDiscount}
                            onChange={(e) => setGlobalDiscount(e.target.value)}
                            className="w-full text-lg font-bold outline-none bg-transparent"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <form onSubmit={handleAddProduct} className="lg:col-span-3 bg-white p-2 rounded-lg border border-gray-300 shadow-sm flex items-end gap-3">
                    <div className="w-24">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Cantidad</label>
                        <input
                            ref={qtyInputRef}
                            type="number"
                            value={form.qty}
                            onChange={e => setForm({ ...form, qty: e.target.value })}
                            className="w-full border border-gray-300 rounded p-1.5 font-bold text-center text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Precio Neto Total de la Fila (Sin IVA)</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={form.netPrice}
                            onChange={e => setForm({ ...form, netPrice: e.target.value })}
                            className="w-full border border-gray-300 rounded p-1.5 font-bold text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                            placeholder="Ej: 150.45"
                        />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md active:scale-95 text-[10px]">
                        <Plus size={16} /> AGREGAR
                    </button>
                </form>
            </div>

            {/* ACCIONES DE SELECCIÓN */}
            {selectedIds.length >= 2 && (
                <div className="bg-amber-100 border-2 border-amber-400 p-2 mb-3 rounded-lg flex justify-between items-center animate-pulse">
                    <span className="text-amber-900 font-black flex items-center gap-2 uppercase">
                        <ListChecks size={18} /> {selectedIds.length} ítems seleccionados para combinar
                    </span>
                    <button onClick={combineSelected} className="bg-amber-600 text-white px-4 py-1.5 rounded-md font-black text-[10px] hover:bg-amber-700 flex items-center gap-2 shadow-sm uppercase">
                        <Combine size={16} /> Combinar Filas
                    </button>
                </div>
            )}

            {/* TABLA PRINCIPAL */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-400 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-800 text-white uppercase text-[9px] tracking-tighter">
                                <th className="border border-gray-600 p-2 w-10 text-center italic">Sel.</th>
                                <th className="border border-gray-600 p-2 text-left">Descripción</th>
                                <th className="border border-gray-600 p-2 text-center w-16">Cant.</th>
                                <th className="border border-gray-600 p-2 text-right text-amber-300 bg-amber-900/20">Desc/Fila</th>
                                <th className="border border-gray-600 p-2 text-right text-blue-300 bg-blue-900/10">Unit. Neto</th>
                                <th className="border border-gray-600 p-2 text-right text-purple-300 bg-purple-900/10">Unit. + IVA</th>
                                {/* LAS DOS ÚLTIMAS COLUMNAS SOLICITADAS */}
                                <th className="border border-gray-600 p-2 text-right bg-gray-700 text-gray-100">Total Neto Org.</th>
                                <th className="border border-gray-600 p-2 text-right bg-green-900/30 text-green-300 font-black">Total + IVA</th>
                                <th className="border border-gray-600 p-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px]">
                            {processedProducts.length === 0 ? (
                                <tr><td colSpan="9" className="p-12 text-center text-gray-400 font-bold italic uppercase tracking-widest">No hay datos en la tabla</td></tr>
                            ) : (
                                processedProducts.map((p) => (
                                    <tr key={p.id} className={`${selectedIds.includes(p.id) ? 'bg-indigo-100' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(p.id)} 
                                                onChange={() => toggleSelect(p.id)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2 font-bold text-gray-700">{p.description}</td>
                                        <td className="border border-gray-300 p-2 text-center font-black text-gray-600">{p.qty}</td>
                                        
                                        <td className="border border-gray-300 p-2 text-right font-mono font-bold text-amber-700 bg-amber-50">
                                            -${discountPerRow.toFixed(4)}
                                        </td>

                                        <td className="border border-gray-300 p-2 text-right font-mono font-bold text-blue-700">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>${p.unitNetWithDiscount.toFixed(4)}</span>
                                                <button onClick={() => copyToClipboard(p.unitNetWithDiscount, 'un', p.id)} className="p-1 text-gray-300 hover:text-blue-600">
                                                    {copiedId === `un-${p.id}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="border border-gray-300 p-2 text-right font-mono font-bold text-purple-700">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>${p.unitWithIva.toFixed(4)}</span>
                                                <button onClick={() => copyToClipboard(p.unitWithIva, 'ui', p.id)} className="p-1 text-gray-300 hover:text-purple-600">
                                                    {copiedId === `ui-${p.id}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>

                                        {/* TOTAL NETO ORIGINAL */}
                                        <td className="border border-gray-300 p-2 text-right font-mono text-gray-500 bg-gray-50">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>${p.netPriceOriginal.toFixed(2)}</span>
                                                <button onClick={() => copyToClipboard(p.netPriceOriginal, 'no', p.id, 2)} className="p-1 text-gray-300 hover:text-gray-600">
                                                    {copiedId === `no-${p.id}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>

                                        {/* TOTAL CON IVA */}
                                        <td className="border border-gray-300 p-2 text-right font-mono font-black text-green-700 bg-green-50">
                                            <div className="flex items-center justify-end gap-1">
                                                <span>${p.rowTotalWithIva.toFixed(2)}</span>
                                                <button onClick={() => copyToClipboard(p.rowTotalWithIva, 'ti', p.id, 2)} className="p-1 text-gray-300 hover:text-green-600">
                                                    {copiedId === `ti-${p.id}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="border border-gray-300 p-2 text-center">
                                            <button onClick={() => removeRow(p.id)} className="text-gray-300 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER DE TOTALES */}
                {products.length > 0 && (
                    <div className="bg-gray-900 p-4 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <button onClick={clearAll} className="flex items-center gap-2 text-[10px] bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded border border-red-600/40 font-black transition-all">
                                <Eraser size={14} /> REINICIAR (ESC)
                            </button>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Suma Netos Originales</p>
                                    <p className="text-sm font-mono font-bold text-gray-200">${finalTotalNetoOriginal.toFixed(2)}</p>
                                </div>
                                <div className="text-right border-l border-white/10 pl-6">
                                    <p className="text-[9px] text-amber-400 font-bold uppercase">Ajuste Aplicado</p>
                                    <p className="text-sm font-mono font-bold text-amber-200">-${discountTotal.toFixed(2)}</p>
                                </div>
                                <div className="text-right border-l border-white/20 pl-6">
                                    <p className="text-[9px] text-green-400 font-black uppercase">Gran Total (+IVA)</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-mono font-black text-green-400 tracking-tighter">
                                            ${finalTotalIva.toFixed(2)}
                                        </span>
                                        <button onClick={() => copyToClipboard(finalTotalIva, 'total', 'grand', 2)} className="p-1.5 bg-green-500/20 rounded text-green-400 hover:bg-green-500 hover:text-white transition-all">
                                            {copiedId === 'total-grand' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IvaTable;