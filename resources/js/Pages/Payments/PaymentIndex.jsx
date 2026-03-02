import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PaymentForm from './Components/PaymentForm';
import Toolbar from './Components/Toolbar';
import PaymentProvider from './State/PaymentProvider';
import DataTable from './Components/DataTable';
import { ToastContainer } from 'react-toastify';
import ConfirmModal from './Components/ConfirmModal';

export default function PaymentIndex() {

    return (
        <AuthenticatedLayout
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-[90%] sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <PaymentProvider>
                                <ToastContainer
                                    position="top-right"
                                    autoClose={3000}
                                    hideProgressBar={false}
                                    newestOnTop
                                    closeOnClick
                                    pauseOnHover
                                    theme="colored"
                                />
                                <ConfirmModal/>
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
