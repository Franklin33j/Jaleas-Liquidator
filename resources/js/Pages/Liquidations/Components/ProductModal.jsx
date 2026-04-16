import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LiquidationContext from '../State/LiquidationContext';

const ProductModal = ({ isOpen,  onSelect }) => {
    const {search, setSearch, handleProductModal } = useContext(LiquidationContext)
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Función que hace la petición al servidor
    const fetchProducts = async (term) => {
        setLoading(true);
        try {
            // Enviamos el objeto con la estructura que Laravel espera recibir
            const response = await axios.post(route('api.product.index'), {
                params: { searchTerm: term }
            });
            // Accedemos a response.data.data porque el controlador devuelve un objeto con 'data'
            setProducts(response.data || []);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Lógica del Debounce (Esperar a que deje de escribir)
    useEffect(() => {
        if (!isOpen) return;

        // Si el usuario borra todo, podemos traer la lista inicial o vaciarla
        if (search.trim() === '') {
            fetchProducts('');
            return;
        }

        // Creamos un temporizador de 500ms
        const timeoutId = setTimeout(() => {
            fetchProducts(search);
        }, 700);

        // LIMPIEZA: Si el usuario escribe otra letra antes de los 500ms,
        // este return cancela el temporizador anterior y empieza uno nuevo.
        return () => clearTimeout(timeoutId);
    }, [search, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded shadow-lg p-4">

                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold">Buscar Producto</h2>
                    {loading && <span className="text-[10px] text-blue-500 animate-pulse">Buscando...</span>}
                </div>

                <input
                    className="w-full border p-2 text-sm mb-3 rounded outline-none focus:border-slate-400"
                    placeholder="Escribe y espera un momento..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />

                <div className="max-h-60 overflow-y-auto border rounded bg-gray-50">
                    {products.length > 0 ? (
                        products.map(p => (
                            <div
                                key={p.id}
                                onClick={() => {
                                    onSelect(p);
                                    handleProductModal(true)
                                }}
                                className="p-2 text-sm hover:bg-blue-100 hover:text-blue-700 cursor-pointer border-b last:border-none transition-colors"
                            >
                                {p.name}
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-400">
                            {loading ? 'Cargando...' : 'No se encontraron resultados'}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleProductModal(true)}
                        className="px-4 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;