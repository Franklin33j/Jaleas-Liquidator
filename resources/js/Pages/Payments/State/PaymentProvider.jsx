import { useForm } from "@inertiajs/react";
import PaymentContext from "./PaymentContext"
import { useState } from "react";


const PaymentProvider = ({ children }) => {
    const [showFormModal, setShowFormModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [search, setSearch] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        receipt_number: '',
        date: new Date().toISOString().split('T')[0],
        client_id: '',
        client_name: '',
        bill_payment: '',
        balance: '',
        invoice_number: '',
        status: true,
        notes: '',
    });


    return (
        <PaymentContext.Provider
            value={{
                showFormModal, setShowFormModal,
                showClientModal, setShowClientModal,
                search, setSearch,
                data, setData, post, processing, errors, reset
            }
            }>
            {children}
        </PaymentContext.Provider>
    )
}
export default PaymentProvider