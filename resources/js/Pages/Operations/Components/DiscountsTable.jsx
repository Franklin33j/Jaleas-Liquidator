import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Copy, Check, Eraser } from 'lucide-react';

const DiscountTable = () => {
    const initialState = { preVenta: '', preDesc: '' };
    const [calc, setCalc] = useState(initialState);
    const [copied, setCopied] = useState(false);
    
    // Referencia para el input de Precio Real
    const inputRealRef = useRef(null);

    // --- LÓGICA DE LIMPIEZA Y FOCO ---
    const handleClear = () => {
        setCalc(initialState);
        // Devolvemos el foco al input de precio real
        inputRealRef.current?.focus();
    };

    // --- ESCUCHA DE TECLA ESC ---
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleClear();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const vReal = parseFloat(calc.preVenta) || 0;
    const vDesc = parseFloat(calc.preDesc) || 0;
    
    // Fórmula: (pre_venta - pre_desc) / pre_venta
    const porcentaje = vReal > 0 ? ((vReal - vDesc) / vReal) : 0;
    const montoDiferencia = vReal - vDesc;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(porcentaje.toFixed(6));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="max-w-md mx-auto mt-5 p-6 bg-white rounded-xl shadow-2xl border border-gray-200 font-sans relative">
            
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                    <Calculator className="text-indigo-600" size={24} />
                    <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Calculador</h2>
                </div>
                
                <button 
                    onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md border border-red-100 hover:bg-red-600 hover:text-white transition-all text-[10px] font-bold uppercase shadow-sm active:scale-95"
                    title="Presiona ESC para limpiar"
                >
                    <Eraser size={14} /> Limpiar (Esc)
                </button>
            </div>

            <div className="space-y-4">
                {/* INPUT PRECIO REAL */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio Real (Pre-Venta)</label>
                    <input 
                        ref={inputRealRef}
                        type="number" 
                        step="0.000001"
                        value={calc.preVenta} 
                        onChange={e => setCalc({...calc, preVenta: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 font-mono font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all shadow-inner"
                        placeholder="0.000000"
                    />
                </div>

                {/* INPUT PRECIO DESCUENTO */}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Precio con Descuento (Pre-Desc)</label>
                    <input 
                        type="number" 
                        step="0.000001"
                        value={calc.preDesc} 
                        onChange={e => setCalc({...calc, preDesc: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-3 font-mono font-bold text-gray-700 outline-none focus:border-indigo-500 transition-all shadow-inner"
                        placeholder="0.000000"
                    />
                </div>

                {/* RESULTADOS */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Monto Descuento:</span>
                        <span className="font-mono font-black text-indigo-700 text-lg">
                            ${montoDiferencia.toFixed(6)}
                        </span>
                    </div>

                    <div className="pt-3 border-t border-indigo-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Factor Porcentaje:</span>
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-indigo-900 text-xl">
                                {porcentaje.toFixed(6)}
                            </span>
                            <button 
                                onClick={copyToClipboard}
                                className={`p-2 rounded-md shadow-sm transition-all flex items-center justify-center ${
                                    copied ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white'
                                }`}
                                title="Copiar al portapapeles"
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="mt-4 text-[9px] text-center text-gray-400 italic">
                Cálculo: (Pre_Venta - Pre_Desc) / Pre_Venta
            </p>
        </div>
    );
};

export default DiscountTable;  