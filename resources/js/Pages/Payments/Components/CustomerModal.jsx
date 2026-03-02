import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import axios from "axios";
import PaymentContext from "../State/PaymentContext";

const CustomerModal = () => {
    const { setShowCustomerModal, showCustomerModal, search, setSearch, setData } = useContext(PaymentContext);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!showCustomerModal) {
            setSearch('');
            setCustomers([]);
        }
    }, [showCustomerModal]);

    useEffect(() => {
        if (search.length <= 1) { setCustomers([]); return; }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await axios.post(
                    route('api.customers.findByMatch'),
                    { search },
                    { signal: controller.signal }
                );
            
                setCustomers(response.data.data || []);
            } catch (error) {
                if (!axios.isCancel(error)) console.error(error);
            } finally {
                setLoading(false);
            }
        }, 400);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [search]);

    const handleSelect = (customer) => {
        setData(prev => ({ ...prev, customer_id: customer.id, customer_name: customer.name }));
        setShowCustomerModal(false);
    };

    if (!showCustomerModal) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowCustomerModal(false)}
        >
            <div className="absolute inset-0 bg-black/50" />

            <div
                className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-widest">
                    Buscar Cliente
                </h3>

                <TextInput
                    placeholder="Nombre o email..."
                    className="w-full mb-3"
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <div className="max-h-60 overflow-y-auto border rounded-md divide-y divide-gray-100">
                    {search.length <= 1 && (
                        <div className="p-3 text-sm text-gray-400">Escribe al menos 2 caracteres...</div>
                    )}
                    {loading && (
                        <div className="p-3 text-sm text-gray-500">Buscando...</div>
                    )}
                    {!loading && search.length > 1 && customers.length === 0 && (
                        <div className="p-3 text-sm text-gray-500">No se encontraron resultados.</div>
                    )}
                    {customers.map(customer => (
                        <div
                            key={customer.id}
                            onClick={() => handleSelect(customer)}
                            className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center text-sm transition"
                        >
                            <div>
                                <p className="text-gray-700 font-medium">{customer.name}</p>
                                <p className="text-xs text-gray-400">{customer.email}</p>
                            </div>
                            <span className="text-indigo-500 font-bold">→</span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end">
                    <SecondaryButton onClick={() => setShowCustomerModal(false)}>
                        Volver
                    </SecondaryButton>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CustomerModal;