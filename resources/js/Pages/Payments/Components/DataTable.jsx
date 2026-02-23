import { useState } from 'react';
import {
    Pencil, Trash2, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Eye,
    CheckCircle2, XCircle, Hash, FileText, User
} from 'lucide-react';

// ── Mock data — refleja exactamente tu migración + join ──────────
const MOCK_DATA = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    receipt_number: 1000 + i,
    invoice_number: 2000 + i,
    date: new Date(2025, 0, (i % 28) + 1).toISOString().split('T')[0],
    customers_id: (i % 5) + 1,
    customer_name: ['Jaleas S.A.', 'Tienda Central', 'Distribuidora Norte', 'Comercial Sur', 'Mega Depósito'][i % 5],
    bill_payment: parseFloat((Math.random() * 4800 + 200).toFixed(2)),
    balance: parseFloat((Math.random() * 500).toFixed(2)),
    status: i % 3 !== 1,
}));

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (n) =>
    `$${Number(n).toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-SV', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

// ── Status Badge ─────────────────────────────────────────────────
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

// ── Balance — ámbar si hay saldo pendiente ───────────────────────
const BalanceBadge = ({ balance }) => (
    <span className={`tabular-nums font-semibold ${balance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
        {fmt(balance)}
    </span>
);

// ── Fila de detalle en modal ──────────────────────────────────────
const DetailRow = ({ label, value, highlight }) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
        <span className="text-gray-400">{label}</span>
        <span className={highlight ? 'font-mono font-bold text-indigo-600' : 'font-semibold text-gray-800'}>
            {value}
        </span>
    </div>
);

// ── Modal de confirmación de eliminación ─────────────────────────
const ConfirmModal = ({ item, onConfirm, onCancel }) => (
    <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
    >
        <div
            className="bg-white rounded-xl shadow-xl w-full max-w-xs p-5 space-y-4"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Trash2 size={16} className="text-red-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">Eliminar recibo</p>
                    <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs">
                <DetailRow label="N° Recibo" value={`#${item.receipt_number}`} highlight />
                <DetailRow label="N° Factura" value={`#${item.invoice_number}`} />
                <DetailRow label="Cliente" value={item.customer_name} />
                <DetailRow label="ID Cliente" value={`CL-${String(item.customers_id).padStart(4, '0')}`} />
                <DetailRow label="Fecha" value={fmtDate(item.date)} />
                <DetailRow label="Pago" value={fmt(item.bill_payment)} />
                <DetailRow label="Saldo" value={fmt(item.balance)} />
            </div>

            <div className="flex gap-2 justify-end">
                <button
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onConfirm(item.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg transition-all"
                >
                    Sí, eliminar
                </button>
            </div>
        </div>
    </div>
);

// ── Paginación ───────────────────────────────────────────────────
const Pagination = ({ current, perPage, totalItems, onPageChange }) => {
    const pages = Math.ceil(totalItems / perPage);
    const from = (current - 1) * perPage + 1;
    const to = Math.min(current * perPage, totalItems);

    const getPageNumbers = () => {
        if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
        if (current <= 3) return [1, 2, 3, 4, 5];
        if (current >= pages - 2) return [pages - 4, pages - 3, pages - 2, pages - 1, pages];
        return [current - 2, current - 1, current, current + 1, current + 2];
    };

    const pageNums = getPageNumbers();

    const Btn = ({ onClick, disabled, children, active }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' :
                    disabled ? 'text-gray-300 cursor-not-allowed' :
                        'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <p className="text-[11px] text-gray-400">
                Mostrando{' '}
                <span className="font-semibold text-gray-600">{from}–{to}</span>
                {' '}de{' '}
                <span className="font-semibold text-gray-600">{totalItems}</span>
                {' '}registros
            </p>
            <div className="flex items-center gap-0.5">
                <Btn onClick={() => onPageChange(1)} disabled={current === 1}><ChevronsLeft size={13} /></Btn>
                <Btn onClick={() => onPageChange(current - 1)} disabled={current === 1}><ChevronLeft size={13} /></Btn>

                {pageNums[0] > 1 && (
                    <>
                        <Btn onClick={() => onPageChange(1)}>1</Btn>
                        {pageNums[0] > 2 && <span className="text-gray-300 text-xs px-1">…</span>}
                    </>
                )}
                {pageNums.map(n => (
                    <Btn key={n} active={n === current} onClick={() => onPageChange(n)}>{n}</Btn>
                ))}
                {pageNums[pageNums.length - 1] < pages && (
                    <>
                        {pageNums[pageNums.length - 1] < pages - 1 && (
                            <span className="text-gray-300 text-xs px-1">…</span>
                        )}
                        <Btn onClick={() => onPageChange(pages)}>{pages}</Btn>
                    </>
                )}

                <Btn onClick={() => onPageChange(current + 1)} disabled={current === pages}><ChevronRight size={13} /></Btn>
                <Btn onClick={() => onPageChange(pages)} disabled={current === pages}><ChevronsRight size={13} /></Btn>
            </div>
        </div>
    );
};

// ── Tabla Principal ──────────────────────────────────────────────
const DataTable = ({ receipts = MOCK_DATA }) => {
    const [data, setData] = useState(receipts);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [confirmItem, setConfirm] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const paginated = data.slice((page - 1) * perPage, page * perPage);

    const handleDelete = (id) => {
        const newData = data.filter(r => r.id !== id);
        setData(newData);
        setConfirm(null);
        if ((page - 1) * perPage >= newData.length && page > 1) setPage(p => p - 1);
    };

    // Todas las columnas mapeadas a los campos de tu migración
    const HEADERS = [
        { label: 'N° Recibo', align: 'left' },
        { label: 'N° Factura', align: 'left' },
        { label: 'Cliente', align: 'left' },
        { label: 'ID Cliente', align: 'left' },
        { label: 'Fecha', align: 'left' },
        { label: 'Pago', align: 'right' },
        { label: 'Saldo', align: 'right' },
        { label: 'Estado', align: 'center' },
        { label: 'Acciones', align: 'right' },
    ];

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-xs my-7">
                <div className="overflow-x-auto">
                    <table className="w-full">

                        {/* ── Cabecera ── */}
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

                        {/* ── Filas ── */}
                        <tbody className="divide-y divide-gray-50">
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-14 text-gray-400">
                                        No hay registros que mostrar.
                                    </td>
                                </tr>
                            ) : paginated.map(row => (
                                <tr
                                    key={row.id}
                                    className={`group transition-colors hover:bg-indigo-50/30 ${editingId === row.id ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-200' : ''
                                        }`}
                                >
                                    {/* receipt_number */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-600">
                                            <Hash size={10} className="opacity-40" />
                                            {row.receipt_number}
                                        </span>
                                    </td>

                                    {/* invoice_number */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 font-mono text-gray-500">
                                            <FileText size={10} className="opacity-40" />
                                            {row.invoice_number}
                                        </span>
                                    </td>

                                    {/* customer_name (join) */}
                                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                                        {row.customer_name}
                                    </td>

                                    {/* customers_id (FK) */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-gray-400 font-mono">
                                            <User size={10} className="opacity-40" />
                                            CL-{String(row.customers_id).padStart(4, '0')}
                                        </span>
                                    </td>

                                    {/* date */}
                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                        {fmtDate(row.date)}
                                    </td>

                                    {/* bill_payment */}
                                    <td className="px-4 py-3 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                                        {fmt(row.bill_payment)}
                                    </td>

                                    {/* balance */}
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <BalanceBadge balance={row.balance} />
                                    </td>

                                    {/* status (boolean) */}
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={row.status} />
                                    </td>

                                    {/* Acciones */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                title="Ver detalle"
                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                            >
                                                <Eye size={13} />
                                            </button>
                                            <button
                                                title="Editar"
                                                onClick={() => setEditingId(editingId === row.id ? null : row.id)}
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${editingId === row.id
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                    }`}
                                            >
                                                <Pencil size={13} />
                                            </button>
                                            <button
                                                title="Eliminar"
                                                onClick={() => setConfirm(row)}
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

                <Pagination
                    current={page}
                    totalItems={data.length}
                    perPage={perPage}
                    onPageChange={setPage}
                />
            </div>

            {confirmItem && (
                <ConfirmModal
                    item={confirmItem}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(null)}
                />
            )}
        </>
    );
};

export default DataTable;