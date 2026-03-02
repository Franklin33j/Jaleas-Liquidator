import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import {
    Search, Calendar, Filter, SortAsc, SortDesc,
    FileText, Table, ChevronDown, User, X, ListOrdered,
    CheckCircle2
} from 'lucide-react';
import PaymentContext from '../State/PaymentContext';

const FilterChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-semibold">
        {label}
        <button onClick={onRemove} className="hover:text-red-500 transition-colors">
            <X size={10} />
        </button>
    </span>
);

const Toolbar = () => {
    const today = new Date().toISOString().split('T')[0];

    const { initialFilters, filters, setFilters, fetchPayments, exportExcelPayments, exportPdf } = useContext(PaymentContext)

    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([{ id: null, name: 'Todos los clientes' }]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (!showCustomerModal) {
            setCustomerSearch('');
            setCustomers([{ id: null, name: 'Todos los clientes' }]);
        }
    }, [showCustomerModal]);

    useEffect(() => {
        if (customerSearch.length <= 1) {
            setCustomers([{ id: null, name: 'Todos los clientes' }]);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoadingCustomers(true);
            try {
                const response = await axios.post(
                    route('api.customers.findByMatch'),
                    { search: customerSearch },
                    { signal: controller.signal }
                );
                setCustomers([
                    { id: null, name: 'Todos los clientes' },
                    ...(response.data.data || [])
                ]);
            } catch (error) {
                if (!axios.isCancel(error)) console.error(error);
            } finally {
                setLoadingCustomers(false);
            }
        }, 400);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [customerSearch]);

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const handleSearch = () => {
        setIsSearching(true);
        fetchPayments()
        setTimeout(() => setIsSearching(false), 800);
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setCustomerSearch('');
    };

    const activeFilterCount = [
        filters.search !== '',
        filters.customer_id !== null,
        filters.from_date !== today || filters.to_date !== today,
        filters.status !== 'all',
    ].filter(Boolean).length;

    const removeChip = (key) => handleFilterChange(key, initialFilters[key]);
    useEffect(() => {
        fetchPayments()
    }, [])


    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 text-xs overflow-hidden">

                {/* ── Fila Principal ── */}
                <div className="flex flex-wrap items-center gap-2 p-3">

                    {/* Búsqueda */}
                    <div className="flex-1 min-w-[160px] relative group">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="N° Recibo..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white focus:border-indigo-300 transition-all placeholder-gray-400"
                            value={filters.search}
                            onChange={e => handleFilterChange('search', e.target.value)}
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange('search', '')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>

                    {/* Selector de Cliente */}
                    <button
                        onClick={() => setShowCustomerModal(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all min-w-[170px] ${filters.customer_id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/40'
                            }`}
                    >
                        <User size={13} className={filters.customer_id ? 'text-indigo-500' : 'text-gray-400'} />
                        <span className="flex-1 truncate font-medium text-left">{filters.customer_name}</span>
                        <ChevronDown size={11} className="text-gray-400 shrink-0" />
                    </button>

                    {/* Rango de Fechas */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <Calendar size={13} className="text-gray-400" />
                        <input
                            type="date"
                            className="bg-transparent border-none p-0 text-xs focus:ring-0 text-gray-600 w-[110px]"
                            value={filters.from_date}
                            onChange={e => handleFilterChange('from_date', e.target.value)}
                        />
                        <span className="text-gray-300 text-xs">→</span>
                        <input
                            type="date"
                            className="bg-transparent border-none p-0 text-xs focus:ring-0 text-gray-600 w-[110px]"
                            value={filters.to_date}
                            onChange={e => handleFilterChange('to_date', e.target.value)}
                        />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

                    {/* Estado */}
                    <select
                        className={`px-2.5 py-1.5 border rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all ${filters.status !== 'all'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                        value={filters.status}
                        onChange={e => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>

                    {/* Items por página */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                        <ListOrdered size={13} className="text-gray-400" />
                        <select
                            className="bg-transparent border-none p-0 text-[11px] focus:ring-0 text-gray-600"
                            value={filters.per_page}
                            onChange={e => handleFilterChange('per_page', e.target.value)}
                        >
                            <option value="10">10 / pág.</option>
                            <option value="15">15 / pág.</option>
                            <option value="20">20 / pág.</option>
                        </select>
                    </div>

                    {/* Orden */}
                    <button
                        onClick={() => handleFilterChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                    >
                        {filters.order === 'asc' ? <SortAsc size={13} /> : <SortDesc size={13} />}
                        <span className="text-[10px] font-semibold uppercase">{filters.order}</span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

                    {/* Botón Buscar */}
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-70 text-white rounded-lg font-semibold text-[11px] transition-all shadow-sm shadow-indigo-200 ml-auto"
                    >
                        {isSearching ? (
                            <>
                                <svg className="animate-spin" width={13} height={13} viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-2a8 8 0 01-8-8z" />
                                </svg>
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search size={13} />
                                Buscar
                            </>
                        )}
                    </button>
                </div>

                {/* ── Fila Secundaria: Chips activos + Exportar ── */}
                <div className={`flex items-center justify-between gap-3 px-3 py-2 border-t border-gray-100 bg-gray-50/60 transition-all ${activeFilterCount > 0 ? 'opacity-100' : 'opacity-70'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeFilterCount > 0 ? (
                            <>
                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    <Filter size={10} />
                                    Activos ({activeFilterCount}):
                                </span>
                                {filters.search && (
                                    <FilterChip label={`"${filters.search}"`} onRemove={() => removeChip('search')} />
                                )}
                                {filters.customer_id && (
                                    <FilterChip
                                        label={filters.customer_name}
                                        onRemove={() => {
                                            removeChip('customer_id');
                                            removeChip('customer_name');
                                        }}
                                    />
                                )}
                                {(filters.from_date !== today || filters.to_date !== today) && (
                                    <FilterChip
                                        label={`${filters.from_date} → ${filters.to_date}`}
                                        onRemove={() => { removeChip('from_date'); removeChip('to_date'); }}
                                    />
                                )}
                                {filters.status !== 'all' && (
                                    <FilterChip
                                        label={filters.status === 'active' ? 'Activos' : 'Inactivos'}
                                        onRemove={() => removeChip('status')}
                                    />
                                )}
                                <button
                                    onClick={resetFilters}
                                    className="text-[10px] text-red-400 hover:text-red-600 font-semibold transition-colors ml-1"
                                >
                                    Limpiar todo
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-green-400" />
                                Sin filtros adicionales aplicados
                            </span>
                        )}
                    </div>

                    {/* Exportar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button className="flex items-center gap-1 px-2.5 py-1 bg-white text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition text-[10px] font-bold shadow-sm"
                            onClick={() => exportPdf()}>
                            <FileText size={12} /> PDF
                        </button>
                        <button className="flex items-center gap-1 px-2.5 py-1 bg-white text-green-700 rounded-lg border border-green-200 hover:bg-green-50 transition text-[10px] font-bold shadow-sm"
                            onClick={() => exportExcelPayments()}>
                            <Table size={12} /> Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Modal de Cliente ── */}
            {showCustomerModal && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowCustomerModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-800">Filtrar por Cliente</h3>
                            <button onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="relative mb-3">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Buscar cliente..."
                                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all"
                                value={customerSearch}
                                onChange={e => setCustomerSearch(e.target.value)}
                            />
                        </div>

                        <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-50">
                            {customerSearch.length <= 1 && (
                                <div className="p-3 text-xs text-gray-400 text-center">
                                    Escribe al menos 2 caracteres...
                                </div>
                            )}
                            {loadingCustomers && (
                                <div className="p-3 text-xs text-gray-400 text-center">Buscando...</div>
                            )}
                            {!loadingCustomers && customerSearch.length > 1 && customers.length <= 1 && (
                                <div className="p-3 text-xs text-gray-500 text-center">No se encontraron resultados.</div>
                            )}
                            {!loadingCustomers && customers.map(c => (
                                <button
                                    key={c.id ?? 'all'}
                                    onClick={() => {
                                        handleFilterChange('customer_id', c.id);
                                        handleFilterChange('customer_name', c.name);
                                        setShowCustomerModal(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition-colors ${c.id === filters.customer_id
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span>{c.name}</span>
                                    {c.id === filters.customer_id && (
                                        <CheckCircle2 size={14} className="text-indigo-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Toolbar;