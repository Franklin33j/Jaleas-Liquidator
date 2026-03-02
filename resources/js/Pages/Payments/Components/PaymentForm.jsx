import { useContext, useState } from 'react'; // Añadimos useState si es necesario
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PaymentContext from '../State/PaymentContext';
import axios from 'axios'; // Importante para el manejo manual
import { toast } from 'react-toastify';

const PaymentForm = () => {
    const {
        showFormModal, setShowFormModal,
        setShowCustomerModal,
        data, setData,
        processing, setProcessing, 
        errors, setErrors,
        reset,
        fetchPayments // Asumo que tienes una función para refrescar la lista
    } = useContext(PaymentContext);

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({}); // Limpiar errores previos

        try {
            // Enviamos vía Axios para recibir el JSON correctamente
            const response = await axios.post(route('api.payments.store'), data);
            
            // Si llega aquí, la respuesta fue 200/201 (éxito)
            setShowFormModal(false);
            reset();
            
            // Refrescar la tabla si tienes la función en el context
            if (fetchPayments) fetchPayments();
            
            toast.success(response.data.message); 

        } catch (err) {
            // Manejo de errores de validación de Laravel (422 Unprocessable Entity)
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                console.error("Error al guardar:", err);
                toast.error(err.data)
            }
        } finally {
            setProcessing(false);
        }
    };

    // Función auxiliar para actualizar el estado manual (si setData es un useState)
    const handleInputChange = (key, value) => {
        setData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <>
            <PrimaryButton onClick={() => setShowFormModal(true)}>
                Registrar Pago
            </PrimaryButton>

            <Modal
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                maxWidth="2xl"
            >
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Nueva Liquidación
                    </h2>

                    <div className="space-y-4">
                        {/* Selector de Cliente */}
                        <div>
                            <InputLabel value="Cliente" />
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCustomerModal(true);
                                }}
                                className="mt-1 flex justify-between items-center p-2 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                            >
                                <span className={data.customer_name ? "text-gray-900 font-medium" : "text-gray-400 italic"}>
                                    {data.customer_name || 'Seleccionar cliente...'}
                                </span>
                                <span className="text-indigo-600 text-xs font-bold uppercase">🔍 Buscar</span>
                            </div>
                            <InputError message={errors.customer_id} className="mt-1" />
                        </div>

                        {/* Grid de campos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="receipt_number" value="N° Recibo" />
                                <TextInput
                                    id="receipt_number"
                                    className="w-full mt-1"
                                    value={data.receipt_number}
                                    onChange={e => handleInputChange('receipt_number', e.target.value)}
                                />
                                <InputError message={errors.receipt_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="invoice_number" value="N° Factura" />
                                <TextInput
                                    id="invoice_number"
                                    className="w-full mt-1"
                                    value={data.invoice_number}
                                    onChange={e => handleInputChange('invoice_number', e.target.value)}
                                />
                                <InputError message={errors.invoice_number} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="bill_payment" value="Monto ($)" />
                                <TextInput
                                    id="bill_payment"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.bill_payment}
                                    onChange={e => handleInputChange('bill_payment', e.target.value)}
                                />
                                <InputError message={errors.bill_payment} className="mt-1" />
                            </div>
                            <div>
                                <InputLabel htmlFor="balance" value="Saldo ($)" />
                                <TextInput
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    className="w-full mt-1"
                                    value={data.balance}
                                    onChange={e => handleInputChange('balance', e.target.value)}
                                />
                                <InputError message={errors.balance} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Notas" />
                            <textarea
                                id="notes"
                                className="resize-none w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-1 h-20 text-sm"
                                value={data.notes || ''}
                                onChange={e => handleInputChange('notes', e.target.value)}
                            />
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton type="button" onClick={() => setShowFormModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing || !data.customer_id}>
                            {processing ? 'Guardando...' : 'Guardar Pago'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default PaymentForm;