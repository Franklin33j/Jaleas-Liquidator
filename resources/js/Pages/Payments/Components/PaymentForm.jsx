import { useContext, useEffect } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PaymentContext from '../State/PaymentContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentForm = () => {
    const {
        showFormModal, setShowFormModal,
        setShowCustomerModal,
        data, setData,
        processing, setProcessing,
        errors, setErrors,
        reset,
        fetchPayments
    } = useContext(PaymentContext);

    // 1. Determinar modo y fecha actual
    const isEditing = data.id && data.id > 0;
    const today = new Date().toLocaleDateString('sv-SE');

    // 2. Efecto para valores iniciales al abrir el modal
    useEffect(() => {
        if (showFormModal) {
            if (!data.date) handleInputChange('date', today);
            if (data.status === undefined || data.status === null) handleInputChange('status', 1);
        }
    }, [showFormModal]);

    // 3. CÁLCULO AUTOMÁTICO: Balance = Factura - Pago
    useEffect(() => {
        const totalFactura = parseFloat(data.invoice_amount) || 0;
        const montoPagado = parseFloat(data.bill_payment) || 0;
        const nuevoSaldo = totalFactura - montoPagado;

        // Solo actualizamos si el valor es numéricamente distinto para evitar loops
        if (parseFloat(data.balance) !== nuevoSaldo) {
            setData(prev => ({
                ...prev,
                balance: nuevoSaldo.toFixed(2)
            }));
        }
    }, [data.invoice_amount, data.bill_payment]);

    const handleInputChange = (key, value) => {
        setData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const submit = async (e) => {
        if (e) e.preventDefault();
        setProcessing(true);
        setErrors({});
        
        // Preparación de datos para la API
        const preparedData = {
            ...data,
            invoice_amount: parseFloat(data.invoice_amount) || 0,
            bill_payment: parseFloat(data.bill_payment) || 0,
            balance: parseFloat(data.balance) || 0,
            receipt_number: data.receipt_number || 0,
            invoice_number: data.invoice_number || 0,
            status: (data.status == 1 || data.status === true) ? 1 : 0
        };

        const url = isEditing
            ? route('api.payments.update', data.id)
            : route('api.payments.store');

        const method = isEditing ? 'put' : 'post';

        try {
            const response = await axios[method](url, preparedData);
            toast.success(response.data.message || 'Operación realizada con éxito');
            setShowFormModal(false);
            reset(); 
            if (fetchPayments) fetchPayments();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
                toast.error('Revisa los errores en el formulario');
            } else {
                console.error('Error en la operación:', error);
                toast.error('Ocurrió un error inesperado');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <PrimaryButton onClick={() => { reset(); setShowFormModal(true); }}>
                Registrar Pago
            </PrimaryButton>

            <Modal show={showFormModal} onClose={() => setShowFormModal(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        {isEditing ? `Editando Pago: REC-${data.receipt_number}` : 'Nueva Liquidación de Pago'}
                    </h2>

                    <div className="space-y-4">
                        {/* Selección de Cliente */}
                        <div>
                            <InputLabel value="Cliente" />
                            <div
                                onClick={() => setShowCustomerModal(true)}
                                className={`mt-1 flex justify-between items-center p-2 border rounded-md cursor-pointer transition ${errors.customer_id ? 'border-red-500 bg-red-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <span className={data.customer_name ? "text-gray-900 font-medium" : "text-gray-400 italic"}>
                                    {data.customer_name || 'Seleccionar cliente...'}
                                </span>
                                <span className="text-indigo-600 text-xs font-bold uppercase">🔍 Buscar</span>
                            </div>
                            <InputError message={errors.customer_id} className="mt-1" />
                        </div>

                        {/* Fila 1: Documentos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="receipt_number" value="N° Recibo" />
                                <TextInput
                                    id="receipt_number"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.receipt_number || ''}
                                    onChange={e => handleInputChange('receipt_number', e.target.value)}
                                />
                                <InputError message={errors.receipt_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="invoice_number" value="N° Factura" />
                                <TextInput
                                    id="invoice_number"
                                    type="number"
                                    className="w-full mt-1"
                                    value={data.invoice_number || ''}
                                    onChange={e => handleInputChange('invoice_number', e.target.value)}
                                />
                                <InputError message={errors.invoice_number} className="mt-1" />
                            </div>
                        </div>

                        {/* Fila 2: Importes Principales */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="invoice_amount" value="Monto Total Factura ($)" />
                                <TextInput
                                    id="invoice_amount"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1 bg-blue-50 focus:ring-blue-200"
                                    value={data.invoice_amount || ''}
                                    onChange={e => handleInputChange('invoice_amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.invoice_amount} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="bill_payment" value="Monto Pagado ($)" />
                                <TextInput
                                    id="bill_payment"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.bill_payment || ''}
                                    onChange={e => handleInputChange('bill_payment', e.target.value)}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.bill_payment} className="mt-1" />
                            </div>
                        </div>

                        {/* Fila 3: Saldo (Automático) y Fecha */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="balance" value="Saldo Restante ($)" />
                                <TextInput
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1 font-bold text-red-600 bg-gray-100 cursor-not-allowed"
                                    value={data.balance || ''}
                                    readOnly // Campo calculado, no editable
                                />
                                <p className="text-[10px] text-gray-400 mt-1 italic">Calculado automáticamente</p>
                                <InputError message={errors.balance} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="date" value="Fecha Documento" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="w-full mt-1"
                                    value={data.date || ''}
                                    onChange={e => handleInputChange('date', e.target.value)}
                                />
                                <InputError message={errors.date} className="mt-1" />
                            </div>
                        </div>

                        {/* Estado y Observaciones */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div className="pt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={data.status == 1 || data.status === true}
                                        onChange={e => handleInputChange('status', e.target.checked ? 1 : 0)}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {data.status == 1 || data.status === true ? 'Registro Activo' : 'Registro Inactivo'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Observaciones" />
                            <textarea
                                id="notes"
                                className="resize-none w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-1 h-20 text-sm"
                                value={data.notes || ''}
                                onChange={e => handleInputChange('notes', e.target.value)}
                                placeholder="Detalles sobre descuentos, retenciones o abonos..."
                            />
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={() => setShowFormModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing || !data.customer_id}>
                            {processing ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Confirmar Pago')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PaymentForm;