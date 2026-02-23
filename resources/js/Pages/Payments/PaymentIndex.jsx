import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PaymentForm from './Components/PaymentForm';
import Toolbar from './Components/Toolbar';
import { useEffect } from 'react';
import axios from 'axios';
import PaymentProvider from './State/PaymentProvider';
import DataTable from './Components/DataTable';

export default function PaymentIndex() {
    useEffect(() => {
        {
            axios.get(route('api.customers.index')) // La URL de tu ruta en Laravel
                .then(response => {
                    // Aquí es donde "ves" los datos por consola para depurar
                    console.log("Datos recibidos:", response.data.data);
                })
                .catch(error => {
                    console.error("Hubo un error:", error);
                });
        };
    }, [])

    return (
        <AuthenticatedLayout

        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-[90%] sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <PaymentProvider>
                                <Toolbar />
                                <PaymentForm />
                                <DataTable />
                            </PaymentProvider>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
