import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import MovementTable from './Components/MovementTable';


export default function MovementIndex() {

    return (
        <AuthenticatedLayout
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-[90%] sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <MovementTable />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
