import { useContext } from "react";
import PaymentContext from "../State/PaymentContext";
import { Trash2 } from "lucide-react";


const ConfirmModal = () => {
    const { setDeleteForm, deletePayment, deleteForm } = useContext(PaymentContext);

    // Si deleteForm es falso, no renderizamos nada (Early return)
    if (!deleteForm) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteForm(false)}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-xs p-5 space-y-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                        <Trash2 size={16} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-800">Eliminar recibo</p>
                        <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => setDeleteForm(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        // Quitamos el 'false' y ejecutamos la función real
                        onClick={deletePayment} 
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg transition-all"
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal