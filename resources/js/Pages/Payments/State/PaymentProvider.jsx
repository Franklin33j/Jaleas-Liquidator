import axios from 'axios'; // 👈 faltaba
import PaymentContext from "./PaymentContext";
import { useEffect, useState } from "react";
import CustomerModal from "../Components/CustomerModal";
import PaymentPDF from '../Components/PaymentPdf';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import { usePage } from '@inertiajs/react';

const PaymentProvider = ({ children }) => {
    const { props } = usePage();

    const initialData = {
        id: 0,
        receipt_number: '',
        date: new Date().toISOString().split('T')[0],
        customer_id: '',
        customer_name: '',
        bill_payment: '',
        balance: '',
        invoice_number: '',
        status: true,
        notes: '',
    };

    const [showFormModal, setShowFormModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [search, setSearch] = useState('');
    const today = new Date().toLocaleDateString('sv-SE');
    const [deleteForm, setDeleteForm] = useState(false);
    const [paymentId, setPaymentId] = useState(0)

    const initialFilters = {
        search: '',
        from_date: today,
        to_date: today,
        status: 'all',
        order: 'desc',
        per_page: '10',
        customer_id: null,
        customer_name: 'Todos los clientes',
    };

    const [filters, setFilters] = useState(initialFilters);
    const [data, setData] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [payments, setPayments] = useState([]);
    const [paginationMeta, setPaginationMeta] = useState({
        current_page: 1,
        last_page: 1,
        from: null,
        to: null,
        total: 0,
        links: [],
        per_page: 10
    });

    const handleDataChange = (keyOrFn, value) => {
        if (typeof keyOrFn === 'function') {
            setData(prev => keyOrFn(prev));
        } else {
            setData(prev => ({ ...prev, [keyOrFn]: value }));
        }
    };

    const reset = () => {
        setData(initialData);
        setErrors({});
    };

    // 👇 Ahora acepta `page` como parámetro
    const fetchPayments = async (page = 1) => {
        try {
            const response = await axios.post(route('api.payments.index'), {
                ...filters,
                page // 👈 enviamos la página al backend
            });
            const paginator = response.data.data;
            setPayments(paginator.data);
            const { data: _, ...meta } = paginator;
            setPaginationMeta(meta);
        } catch (error) {
            console.error("Error al cargar pagos:", error);
        }
    };

    const exportExcelPayments = async () => {
        try {
            setProcessing(true);

            const response = await axios({
                url: route('api.payments.exportExcel'),
                method: 'POST',
                data: filters, // Enviamos los filtros actuales (dates, search, etc.)
                responseType: 'blob', // IMPORTANTÍSIMO para archivos Excel
            });

            // Crear un enlace temporal para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Nombre del archivo con fecha actual
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `reporte-pagos-${date}.xlsx`);

            document.body.appendChild(link);
            link.click();

            // Limpieza
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel generado correctamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('No se pudo generar el reporte Excel');
        } finally {
            setProcessing(false);
        }
    };


    const exportPdf = async () => {
        try {
            // 1. Abrimos una pestaña vacía inmediatamente para evitar bloqueos de pop-ups
            const newTab = window.open();
            newTab.document.write("Generando reporte, por favor espere...");

            // 2. Traemos los datos filtrados de Laravel (usando tus filtros actuales)
            const response = await axios.post(route('api.payments.exportPDF'), {
                params: { ...filters, export: true } // 'filters' debe ser tu estado actual de búsqueda
            });

            const payments = response.data.data;

            if (payments.length === 0) {
                newTab.close();
                return toast.warning("No hay datos para exportar");
            }

            // 3. Generamos el BLOB del PDF usando el diseño
            const blob = await pdf(<PaymentPDF payments={payments} appName={props.auth.appName} userName={props.auth.user.name} />).toBlob();
            const url = URL.createObjectURL(blob);

            // 4. Cargamos el PDF en la pestaña que ya abrimos
            newTab.location.href = url;

        } catch (error) {
            console.error(error);
            toast.error("Error al generar el PDF");
        }
    };
    const deletePayment = async (id) => {
        try {
            await axios.delete(route('api.payments.destroy', paymentId));
            // Refresca la lista sin recargar la página
            fetchPayments();
            setDeleteForm(false);
            toast.success('Pago eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar el pago');
        }
    };

    useEffect(() => {

        fetchPayments();
    }, []);

    return (
        <PaymentContext.Provider value={{
            showFormModal, setShowFormModal,
            showCustomerModal, setShowCustomerModal,
            search, setSearch,
            data, setData: handleDataChange,
            processing, setProcessing,
            errors, setErrors,
            reset,
            initialFilters,
            filters, setFilters,
            fetchPayments,
            paginationMeta, setPaginationMeta,
            payments, setPayments,
            exportExcelPayments,
            exportPdf,
            deleteForm, setDeleteForm,
            paymentId, setPaymentId,
            deletePayment

        }}>
            {children}
            <CustomerModal />
        </PaymentContext.Provider>
    );
};

export default PaymentProvider;