import { useContext, useState } from 'react';
import React from 'react';
import {
    Pencil, Trash2, Eye,
    CheckCircle2, XCircle, Hash, FileText, User
} from 'lucide-react';
import Pagination from './Pagination';
import PaymentContext from '../State/PaymentContext';

const fmt = (n) =>
    `$${Number(n).toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-SV', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${status
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200'
        }`}>
        {status
            ? <><CheckCircle2 size={10} /> Activo</>
            : <><XCircle size={10} /> Inactivo</>
        }
    </span>
);

const BalanceBadge = ({ balance }) => (
    <span className={`tabular-nums font-semibold ${balance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
        {fmt(balance)}
    </span>
);


const DataTable = () => {
    const { payments, setPaymentId, setDeleteForm } = useContext(PaymentContext);
    const [editingId, setEditingId] = useState(null);

    const handleDelete = (id) => {
        console.log(id)
        setDeleteForm(true)
        setPaymentId(id)
    };

    const HEADERS = [
        { label: 'N° Recibo', align: 'left' },
        { label: 'N° Factura', align: 'left' },
        { label: 'Cliente', align: 'left' },
        { label: 'ID Cliente', align: 'left' },
        { label: 'Fecha', align: 'left' },
        { label: 'Pago', align: 'right' },
        { label: 'Saldo', align: 'right' },
        { label: 'Estado', align: 'center' },
        { label: 'Notas', align: 'left' },
        { label: 'Acciones', align: 'right' },
    ];

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-xs my-7">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                {HEADERS.map(h => (
                                    <th
                                        key={h.label}
                                        className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap text-${h.align}`}
                                    >
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {payments?.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="text-center py-14 text-gray-400">
                                        No hay registros que mostrar.
                                    </td>
                                </tr>
                            ) : payments?.map(row => (
                                <tr
                                    key={row.id}
                                    className={`group transition-colors hover:bg-indigo-50/30 ${editingId === row.id ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-200' : ''}`}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600">
                                            <Hash size={10} className="opacity-40" />
                                            {row.receipt_number}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 font-mono text-gray-500">
                                            <FileText size={10} className="opacity-40" />
                                            {row.invoice_number}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                                        {row.customer_name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-gray-400 font-mono">
                                            <User size={10} className="opacity-40" />
                                            CL-{String(row.customer_id).padStart(8, '0')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                        {fmtDate(row.date)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                                        {fmt(row.bill_payment)}
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <BalanceBadge balance={row.balance} />
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={row.status} />
                                    </td>

                                    {/* 👇 Columna Notas */}
                                    <td className="px-4 py-3 max-w-[180px]">
                                        <span
                                            className="block truncate text-gray-500"
                                            title={row.notes}
                                        >
                                            {row.notes || <span className="text-gray-300">—</span>}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                <Eye size={13} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(editingId === row.id ? null : row.id)}
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${editingId === row.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(row.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination />
            </div>

           
        </>
    );
};

export default DataTable;