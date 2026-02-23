import { useContext } from 'react';

// Componentes del Starter Kit
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import PaymentContext from '../State/PaymentContext';

const PaymentForm = () => {
    const { showFormModal, setShowFormModal, setShowClientModal, showClientModal, search, setSearch, data, setData, post, processing, errors, reset } = useContext(PaymentContext)


    const mockClients = [
        { id: 1, name: 'Jaleas S.A.' },
        { id: 2, name: 'Tienda Central' },
        { id: 3, name: 'Distribuidora Norte' }
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('payments.store'), {
            onSuccess: () => {
                setShowFormModal(false);
                reset();
            }
        });
    };

    return (
        <>
            {/* Botón principal para abrir el formulario */}
            <PrimaryButton onClick={() => setShowFormModal(true)}>
                Registrar Pago
            </PrimaryButton>

            {/* MODAL 1: El Formulario Principal */}
            <Modal show={showFormModal} onClose={() => setShowFormModal(false)} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                        Nueva Liquidación
                    </h2>

                    <div className="space-y-4">
                        {/* Selector de Cliente Estilo Botón */}
                        <div>
                            <InputLabel value="Cliente" />
                            <div
                                onClick={() => setShowClientModal(true)}
                                className="mt-1 flex justify-between items-center p-2 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                            >
                                <span className={data.client_name ? "text-gray-900 font-medium" : "text-gray-400 italic"}>
                                    {data.client_name || 'Seleccionar cliente...'}
                                </span>
                                <span className="text-indigo-600 text-xs font-bold uppercase">🔍 Buscar</span>
                            </div>
                            <InputError message={errors.client_id} className="mt-1" />
                        </div>

                        {/* Grid de campos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="receipt_number" value="N° Recibo" />
                                <TextInput id="receipt_number" className="w-full mt-1" value={data.receipt_number} onChange={e => setData('receipt_number', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel htmlFor="invoice_number" value="N° Factura" />
                                <TextInput id="invoice_number" className="w-full mt-1" value={data.invoice_number} onChange={e => setData('invoice_number', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel htmlFor="bill_payment" value="Monto ($)" />
                                <TextInput type="number" className="w-full mt-1" value={data.bill_payment} onChange={e => setData('bill_payment', e.target.value)} />
                            </div>
                            <div>
                                <InputLabel htmlFor="balance" value="Saldo ($)" />
                                <TextInput type="number" className="w-full mt-1" value={data.balance} onChange={e => setData('balance', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="notes" value="Notas" />
                            <textarea
                                className="resize-none w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 mt-1 h-20 text-sm"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={() => setShowFormModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing || !data.client_id}>
                            {processing ? 'Guardando...' : 'Guardar Pago'}
                        </PrimaryButton>
                    </div>
                </form>

                {/* MODAL 2: Buscador de Clientes (Dentro del Modal 1) */}
                <Modal
                    show={showClientModal}
                    onClose={() => setShowClientModal(false)}
                    maxWidth="xl"
                >
                    <div className="p-4">
                        <h3 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-widest">Buscar Cliente</h3>
                        <TextInput
                            placeholder="Escriba nombre..."
                            className="w-full mb-3"
                            autoFocus
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="max-h-48 overflow-y-auto border rounded-md divide-y divide-gray-100 ">
                            {mockClients
                                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                                .map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => {
                                            setData(d => ({ ...d, client_id: c.id, client_name: c.name }));
                                            setShowClientModal(false);
                                        }}
                                        className="p-3 hover:bg-indigo-50 cursor-pointer flex justify-between items-center text-sm transition"
                                    >
                                        <span className="text-gray-700 font-medium">{c.name}</span>
                                        <span className="text-indigo-500 font-bold">→</span>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="mt-4 flex justify-end">
                            <SecondaryButton onClick={() => setShowClientModal(false)}>Volver</SecondaryButton>
                        </div>
                    </div>
                </Modal>
            </Modal>
        </>
    );
};

export default PaymentForm;