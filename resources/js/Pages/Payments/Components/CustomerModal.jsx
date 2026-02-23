import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";

const CustomerModal = () => {
       const { setShowClientModal, showClientModal, search, setSearch,  setData } = useContext(PaymentContext)

    return (
        <>
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

        </>
    )
}
export default CustomerModal