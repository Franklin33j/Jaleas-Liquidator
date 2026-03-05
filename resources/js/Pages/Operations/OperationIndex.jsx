import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import IvaTable from "./Components/IvaTable";
import DiscountTable from "./Components/DiscountsTable";
import { useState } from "react";
import { ChevronDown, ChevronUp, Calculator, Table } from "lucide-react";

const OperationIndex = () => {
    // Inicialmente ninguna está abierta (null) o puedes dejar 'iva' por defecto
    const [activeTab, setActiveTab] = useState(null);

    const toggleTab = (tab) => {
        // Si la pestaña clickeada es la misma que está activa, la cerramos (null)
        // De lo contrario, activamos la nueva pestaña
        setActiveTab(prevTab => prevTab === tab ? null : tab);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Operaciones" />

            <div className="py-6">
                <div className="mx-auto max-w-[95%] sm:px-6 lg:px-8 space-y-4">
                    
                    {/* SECCIÓN ACORDEÓN: TABLA IVA */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-200">
                        <button 
                            onClick={() => toggleTab('iva')}
                            className={`w-full flex items-center justify-between p-4 transition-all duration-200 ${
                                activeTab === 'iva' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                                <Table size={18} />
                                Calculadora de IVA y Prorrateo
                            </div>
                            {activeTab === 'iva' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        
                        {activeTab === 'iva' && (
                            <div className="p-4 bg-white border-t border-gray-100">
                                <IvaTable />
                            </div>
                        )}
                    </div>

                    {/* SECCIÓN ACORDEÓN: CALCULADORA DESCUENTO */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-200">
                        <button 
                            onClick={() => toggleTab('discount')}
                            className={`w-full flex items-center justify-between p-4 transition-all duration-200 ${
                                activeTab === 'discount' 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                                <Calculator size={18} />
                                Calculador de Porcentaje de Descuento
                            </div>
                            {activeTab === 'discount' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        
                        {activeTab === 'discount' && (
                            <div className="p-6 bg-white border-t border-gray-100">
                                <DiscountTable />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default OperationIndex;  