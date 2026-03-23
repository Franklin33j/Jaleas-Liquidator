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

    // 1. Determinar modo dinámicamente
    const isEditing = data.id && data.id > 0;

    const today = new Date().toLocaleDateString('sv-SE');

    useEffect(() => {
        if (showFormModal) {
            if (!data.date) handleInputChange('date', today);
            // Asegurar que el status tenga un valor inicial si es nuevo
            if (data.status === undefined || data.status === null) handleInputChange('status', 1);
        }
    }, [showFormModal]);

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

        // 1. Preparamos los datos para asegurar que los campos numéricos vacíos viajen como 0
        const preparedData = {
            ...data,
            bill_payment: (data.bill_payment === '' || data.bill_payment === null || data.bill_payment === undefined)
                ? 0
                : data.bill_payment,
            balance: (data.balance === '' || data.balance === null || data.balance === undefined)
                ? 0
                : data.balance,
            receipt_number: (data.receipt_number === '' || data.receipt_number === null || data.receipt_number === undefined)
                ? 0
                : data.receipt_number,
            invoice_number: (data.invoice_number === '' || data.invoice_number === null || data.invoice_number === undefined)
                ? 0
                : data.invoice_number,
            // Forzamos que el status viaje como entero (0 o 1) para evitar problemas de tipos en la DB
            status: (data.status == 1 || data.status === true) ? 1 : 0
        };

        // 2. Definimos la URL y el método según si es edición o creación
        const url = isEditing
            ? route('api.payments.update', data.id)
            : route('api.payments.store');

        const method = isEditing ? 'put' : 'post';

        try {
            // 3. Enviamos 'preparedData' en lugar del estado original 'data'
            const response = await axios[method](url, preparedData);

            toast.success(response.data.message || 'Operación realizada con éxito');

            // Cerramos el modal y limpiamos el formulario
            setShowFormModal(false);
            reset();

            // Refrescamos la lista de pagos si la función existe
            if (fetchPayments) fetchPayments();

        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Errores de validación de Laravel (PaymentRequest)
                setErrors(error.response.data.errors);
                toast.error('Revisa los errores en el formulario');
            } else {
                console.error('Error en la operación:', error);
                toast.error('Ocurrió un error inesperado al procesar el pago');
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
                    {/* 2. Título Dinámico */}
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        {isEditing ? `Editando Pago: REC-${data.receipt_number}` : 'Nueva Liquidación de Pago'}
                    </h2>

                    <div className="space-y-4">
                        {/* Cliente */}
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

                        <div className="grid grid-cols-2 gap-4">
                            {/* Recibo e Factura con type="number" para mayor seguridad */}
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

                            {/* Montos */}
                            <div>
                                <InputLabel htmlFor="bill_payment" value="Monto Pagado ($)" />
                                <TextInput
                                    id="bill_payment"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.bill_payment || ''}
                                    onChange={e => handleInputChange('bill_payment', e.target.value)}
                                />
                                <InputError message={errors.bill_payment} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="balance" value="Saldo Restante ($)" />
                                <TextInput
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.balance || ''}
                                    onChange={e => handleInputChange('balance', e.target.value)}
                                />
                                <InputError message={errors.balance} className="mt-1" />
                            </div>

                            {/* Fecha */}
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

                            {/* 3. Toggle Corregido para manejar 0/1 de la DB */}
                            <div className="flex flex-col justify-center pt-5">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        // Comprobamos si es 1 o true
                                        checked={data.status == 1 || data.status === true}
                                        onChange={e => handleInputChange('status', e.target.checked ? 1 : 0)}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                        {data.status == 1 || data.status === true ? 'Registro Activo' : 'Registro Inactivo'}
                                    </span>
                                </label>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Observaciones" />
                            <textarea
                                id="notes"
                                className="resize-none w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-1 h-20 text-sm"
                                value={data.notes || ''}
                                onChange={e => handleInputChange('notes', e.target.value)}
                                placeholder="Detalles adicionales..."
                            />
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={() => setShowFormModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        {/* 4. Texto del Botón Dinámico */}
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