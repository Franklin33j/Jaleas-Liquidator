import { useContext } from 'react'; // Importamos el hook
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import PaymentContext from '../State/PaymentContext'; // Ajusta la ruta

const Pagination = () => {
    // Extraemos todo lo necesario del Contexto
    const { paginationMeta, fetchPayments } = useContext(PaymentContext);

    // Si no hay metadata o el total es 0, no renderizamos nada
    if (!paginationMeta || paginationMeta.total === 0) return null;

    // Renombramos para usar tu lógica interna sin cambiar el diseño
    const current = paginationMeta.current_page;
    const perPage = paginationMeta.per_page;
    const totalItems = paginationMeta.total;
    const pages = paginationMeta.last_page; // Laravel ya nos da el total de páginas
    const onPageChange = (page) => fetchPayments(page);

    const from = paginationMeta.from || 0;
    const to = paginationMeta.to || 0;

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
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' :
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

export default Pagination;