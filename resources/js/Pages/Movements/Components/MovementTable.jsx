import { useState, useMemo, useEffect, useRef } from "react";

let _rowId = 0;
const newFila = (producto, movimientos) => ({
    _id: ++_rowId,
    catalogId: producto.id,
    name: producto.name,
    sku: producto.sku,
    invAnt: "",
    movs: Object.fromEntries(movimientos.map((m) => [m.id, ""])),
    retorno: "",
});

const toNum = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));

const calcTotal = (fila, movimientos) => {
    let t = toNum(fila.invAnt);
    movimientos.forEach((m) => {
        const v = toNum(fila.movs[m.id]);
        t += m.tipo === "carga" ? v : -v;
    });
    return t;
};

const calcVentas = (fila, movimientos) =>
    Math.max(0, calcTotal(fila, movimientos) - toNum(fila.retorno));

const VENDEDORES = [
    { id: 1, name: "Carlos Mendoza" },
    { id: 2, name: "Ana Reyes" },
    { id: 3, name: "Luis Flores" },
    { id: 4, name: "María López" },
    { id: 5, name: "Jorge Ramírez" },
    { id: 6, name: "Sofía Hernández" },
    { id: 7, name: "Diego Torres" },
    { id: 8, name: "Patricia Vásquez" },
];

const CATALOG_INICIAL = [
    { id: 1, name: "FAMOSA FUERTE 50 LB", sku: "FAM-001" },
    { id: 2, name: "MANTECA AGROPAL 50 LB", sku: "AGR-050" },
    { id: 3, name: "ACEITE PALMA 1 LT", sku: "ACE-001" },
    { id: 4, name: "HARINA DE TRIGO 25 KG", sku: "HAR-025" },
    { id: 5, name: "AZÚCAR MORENA 50 LB", sku: "AZU-050" },
    { id: 6, name: "SAL YODADA 1 KG", sku: "SAL-001" },
    { id: 7, name: "FRIJOL NEGRO 1 LB", sku: "FRJ-001" },
    { id: 8, name: "ARROZ BLANQUEADO 5 LB", sku: "ARR-005" },
];

function focusCell(tableRef, row, col) {
    if (!tableRef.current) return;
    const el = tableRef.current.querySelector(
        `input[data-row="${row}"][data-col="${col}"]`
    );
    if (el) { el.focus(); el.select(); }
}

function NumInput({ value, onChange, rowIdx, colIdx, totalRows, totalCols, tableRef }) {
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (rowIdx + 1 < totalRows) focusCell(tableRef, rowIdx + 1, colIdx);
        } else if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            if (colIdx + 1 < totalCols) {
                focusCell(tableRef, rowIdx, colIdx + 1);
            } else if (rowIdx + 1 < totalRows) {
                focusCell(tableRef, rowIdx + 1, 0);
            }
        } else if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            if (colIdx - 1 >= 0) {
                focusCell(tableRef, rowIdx, colIdx - 1);
            } else if (rowIdx - 1 >= 0) {
                focusCell(tableRef, rowIdx - 1, totalCols - 1);
            }
        }
    };

    return (
        <input
            type="number"
            min="0"
            placeholder="—"
            value={value}
            data-row={rowIdx}
            data-col={colIdx}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            style={{
                width: "100%",
                border: "none",
                background: "transparent",
                textAlign: "center",
                fontSize: 12,
                padding: "1px 4px",
                outline: "none",
                color: "var(--color-text-primary)",
            }}
            className="focus:bg-blue-50 rounded"
        />
    );
}

function MovimientoPopover({ anchorRef, onConfirm, onClose }) {
    const [name, setName] = useState("");
    const popRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (
                popRef.current && !popRef.current.contains(e.target) &&
                anchorRef.current && !anchorRef.current.contains(e.target)
            ) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose, anchorRef]);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleTipo = (tipo) => {
        if (!name.trim()) return;
        onConfirm({ id: `mov_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: name.trim(), tipo });
    };

    return (
        <div
            ref={popRef}
            style={{
                position: "absolute",
                zIndex: 100,
                top: "calc(100% + 6px)",
                right: 0,
                width: 240,
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: "var(--border-radius-lg)",
                padding: "12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            }}
        >
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Nuevo movimiento
            </p>
            <input
                autoFocus
                type="text"
                placeholder="Nombre (ej. Carga 40)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
                style={{
                    width: "100%", boxSizing: "border-box",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "6px 8px", fontSize: 13,
                    color: "var(--color-text-primary)",
                    background: "var(--color-background-primary)",
                    outline: "none", marginBottom: 8,
                }}
            />
            <div style={{ display: "flex", gap: 6 }}>
                <button
                    onClick={() => handleTipo("carga")}
                    disabled={!name.trim()}
                    style={{
                        flex: 1, padding: "7px 4px",
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid #9FE1CB",
                        background: name.trim() ? "#E1F5EE" : "var(--color-background-secondary)",
                        color: name.trim() ? "#0F6E56" : "var(--color-text-tertiary)",
                        fontSize: 12, fontWeight: 500,
                        cursor: name.trim() ? "pointer" : "not-allowed",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    }}
                >
                    <span style={{ fontSize: 16 }}>＋</span>Carga
                </button>
                <button
                    onClick={() => handleTipo("devolucion")}
                    disabled={!name.trim()}
                    style={{
                        flex: 1, padding: "7px 4px",
                        borderRadius: "var(--border-radius-md)",
                        border: "0.5px solid #F5C4B3",
                        background: name.trim() ? "#FAECE7" : "var(--color-background-secondary)",
                        color: name.trim() ? "#993C1D" : "var(--color-text-tertiary)",
                        fontSize: 12, fontWeight: 500,
                        cursor: name.trim() ? "pointer" : "not-allowed",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    }}
                >
                    <span style={{ fontSize: 16 }}>－</span>Devolución
                </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "6px 0 0", textAlign: "center" }}>
                Escribe el nombre y elige el tipo
            </p>
        </div>
    );
}

function ProductSearchModal({ catalog, currentIds, onConfirm, onClose }) {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [focusedIdx, setFocusedIdx] = useState(-1);
    const listRef = useRef(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return catalog.filter(
            (p) => !currentIds.has(p.id) &&
                (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
        );
    }, [query, catalog, currentIds]);

    // Refs para acceder a valores actuales dentro del listener estático
    const focusedIdxRef = useRef(focusedIdx);
    const filteredRef = useRef(filtered);
    const selectedIdRef = useRef(selectedId);
    const onConfirmRef = useRef(onConfirm);
    const onCloseRef = useRef(onClose);

    useEffect(() => { focusedIdxRef.current = focusedIdx; }, [focusedIdx]);
    useEffect(() => { filteredRef.current = filtered; }, [filtered]);
    useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
    useEffect(() => { onConfirmRef.current = onConfirm; }, [onConfirm]);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => { setFocusedIdx(-1); }, [query]);

    // Scroll automático al item enfocado
    useEffect(() => {
        if (!listRef.current || focusedIdx < 0) return;
        const item = listRef.current.querySelectorAll("[data-item]")[focusedIdx];
        if (item) item.scrollIntoView({ block: "nearest" });
    }, [focusedIdx]);

    // Listener registrado UNA sola vez
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") { onCloseRef.current(); return; }
            if (e.key === "Enter") {
                const fi = focusedIdxRef.current;
                const fl = filteredRef.current;
                const si = selectedIdRef.current;
                if (fi >= 0 && fl[fi]) {
                    onConfirmRef.current(fl[fi].id);
                } else if (si) {
                    onConfirmRef.current(si);
                }
                return;
            }
            if (e.key === "Tab") {
                e.preventDefault();
                setFocusedIdx((prev) =>
                    e.shiftKey
                        ? prev <= 0 ? filteredRef.current.length - 1 : prev - 1
                        : prev >= filteredRef.current.length - 1 ? 0 : prev + 1
                );
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIdx((prev) => Math.min(prev + 1, filteredRef.current.length - 1));
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedIdx((prev) => Math.max(prev - 1, 0));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const handleConfirm = () => { if (selectedId) onConfirm(selectedId); };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-16"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl border border-gray-200 w-[420px] max-w-[95vw] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-medium">Buscar producto</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
                </div>
                <div className="relative mb-3">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8.5" cy="8.5" r="5.5" />
                        <path d="M15 15l-3-3" strokeLinecap="round" />
                    </svg>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
                <div ref={listRef} className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mb-4">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            {query ? `Sin resultados para "${query}"` : "Todos los productos ya fueron agregados"}
                        </div>
                    ) : (
                        filtered.map((p, idx) => {
                            const isSel = selectedId === p.id;
                            const isFocused = focusedIdx === idx;
                            return (
                                <div
                                    key={p.id}
                                    data-item
                                    onClick={() => setSelectedId(p.id)}
                                    onDoubleClick={() => onConfirm(p.id)}
                                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                                        isSel ? "bg-blue-50" : isFocused ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div>
                                        <div className="text-sm font-medium">{p.name}</div>
                                        
                                    </div>
                                    {isSel && (
                                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                        {focusedIdx >= 0 ? "↑↓ · Tab navega · Enter agrega" : selectedId ? "1 seleccionado" : "Selecciona un producto"}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedId}
                            className="px-4 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >Agregar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CargaPickerModal({ movimiento, fila, onConfirm, onClose }) {
    const [step, setStep] = useState("pick");
    const [tipo, setTipo] = useState(null);
    const [cantidad, setCantidad] = useState("");

    const handlePickType = (t) => { setTipo(t); setStep("number"); setCantidad(""); };
    const handleConfirm = () => { onConfirm(cantidad === "" ? "" : Number(cantidad)); };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-16"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl border border-gray-200 w-[340px] max-w-[95vw] p-5">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-medium">{movimiento.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
                </div>
                <p className="text-xs text-gray-400 mb-4">{fila.name}</p>
                {step === "pick" ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handlePickType("carga")}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-green-800">
                            <span className="text-2xl font-light">＋</span>
                            <span className="text-sm font-medium">Carga</span>
                            <span className="text-xs text-green-600">suma al inventario</span>
                        </button>
                        <button onClick={() => handlePickType("devolucion")}
                            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-red-800">
                            <span className="text-2xl font-light">－</span>
                            <span className="text-sm font-medium">Devolución</span>
                            <span className="text-xs text-red-600">resta al inventario</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${tipo === "carga" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {tipo === "carga" ? "＋ Carga" : "－ Devolución"}
                        </div>
                        <label className="block text-xs text-gray-500 font-medium mb-1">
                            {tipo === "carga" ? "Cantidad a cargar" : "Cantidad a devolver"}
                        </label>
                        <input
                            autoFocus
                            type="number"
                            min="0"
                            placeholder="0"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <div className="flex gap-2 justify-between">
                            <button onClick={() => setStep("pick")} className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">← Atrás</button>
                            <button onClick={handleConfirm} className="px-4 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800">Confirmar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MovementTable({ catalog = CATALOG_INICIAL, onProcesar }) {
    const [filas, setFilas] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [modal, setModal] = useState(null);
    const [cargaCtx, setCargaCtx] = useState(null);
    const [showMovPopover, setShowMovPopover] = useState(false);
    const [vendedorId, setVendedorId] = useState("");
    const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);

    const movBtnRef = useRef(null);
    const tableRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "F1") { e.preventDefault(); setModal("product"); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const updateFila = (id, key, value) =>
        setFilas((prev) => prev.map((f) => (f._id === id ? { ...f, [key]: value } : f)));

    const updateMov = (filaId, movId, value) =>
        setFilas((prev) =>
            prev.map((f) =>
                f._id === filaId ? { ...f, movs: { ...f.movs, [movId]: value } } : f
            )
        );

    const delFila = (id) => setFilas((prev) => prev.filter((f) => f._id !== id));

    const handleProductConfirm = (selectedId) => {
        const p = catalog.find((c) => c.id === selectedId);
        if (!p) return;
        const fila = newFila(p, movimientos);
        setFilas((prev) => {
            const next = [...prev, fila];
            setTimeout(() => focusCell(tableRef, next.length - 1, 0), 50);
            return next;
        });
        setModal(null);
    };

    const handleMovConfirm = (mov) => {
        setMovimientos((prev) => [...prev, mov]);
        setFilas((prev) => prev.map((f) => ({ ...f, movs: { ...f.movs, [mov.id]: "" } })));
        setShowMovPopover(false);
    };

    const handleCargaConfirm = (value) => {
        if (cargaCtx) updateMov(cargaCtx.filaId, cargaCtx.movId, value);
        setCargaCtx(null);
    };

    const sumCol = (key) => filas.reduce((a, f) => a + toNum(f[key]), 0);
    const sumMov = (id) => filas.reduce((a, f) => a + toNum(f.movs[id]), 0);
    const sumTotal = filas.reduce((a, f) => a + calcTotal(f, movimientos), 0);
    const sumVentas = filas.reduce((a, f) => a + calcVentas(f, movimientos), 0);

    const getJson = () => ({
        vendedor: VENDEDORES.find((v) => v.id === Number(vendedorId)) ?? null,
        fecha,
        movimientos: movimientos.map((m) => ({ id: m.id, name: m.name, tipo: m.tipo })),
        filas: filas.map((f) => ({
            catalogId: f.catalogId,
            name: f.name,
            sku: f.sku,
            invAnt: toNum(f.invAnt),
            movs: Object.fromEntries(movimientos.map((m) => [m.id, toNum(f.movs[m.id])])),
            total: calcTotal(f, movimientos),
            retorno: toNum(f.retorno),
            ventas: calcVentas(f, movimientos),
        })),
        totales: {
            invAnt: sumCol("invAnt"),
            movimientos: Object.fromEntries(movimientos.map((m) => [m.id, sumMov(m.id)])),
            total: sumTotal,
            retorno: sumCol("retorno"),
            ventas: sumVentas,
        },
    });

    const loadFromJson = (data) => {
        if (data.vendedor) setVendedorId(String(data.vendedor.id));
        if (data.fecha) setFecha(data.fecha);
        const movsCargados = (data.movimientos ?? []).map((m) => ({ id: m.id, name: m.name, tipo: m.tipo }));
        setMovimientos(movsCargados);
        setFilas(
            (data.filas ?? []).map((f) => ({
                _id: ++_rowId,
                catalogId: f.catalogId,
                name: f.name,
                sku: f.sku,
                invAnt: f.invAnt ?? "",
                movs: Object.fromEntries(movsCargados.map((m) => [m.id, f.movs?.[m.id] ?? ""])),
                retorno: f.retorno ?? "",
            }))
        );
    };

    const handleProcesar = () => {
        if (!vendedorId || !fecha) return;
        const json = getJson();
        console.log(json);
        onProcesar?.(json);
    };

    const currentIds = useMemo(() => new Set(filas.map((f) => f.catalogId)), [filas]);
    const cargaFila = cargaCtx ? filas.find((f) => f._id === cargaCtx.filaId) : null;
    const cargaMov = cargaCtx ? movimientos.find((m) => m.id === cargaCtx.movId) : null;

    const totalCols = 1 + movimientos.length + 1;
    const totalRows = filas.length;

    return (
        <>
            {/* Cabecera */}
            <div className="flex items-center gap-2.5 px-3 py-2 flex-wrap">
                <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Vendedor</label>
                <select
                    value={vendedorId}
                    onChange={(e) => setVendedorId(e.target.value)}
                    className="flex-1 min-w-[160px] max-w-[220px] border border-gray-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                    <option value="">— Seleccionar —</option>
                    {VENDEDORES.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
                <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Fecha</label>
                <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                />
                <button
                    onClick={handleProcesar}
                    disabled={!vendedorId || !fecha}
                    className="px-4 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    Procesar
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2">
                <button
                    onClick={() => { setFilas([]); setMovimientos([]); }}
                    className="flex items-center gap-1.5 text-red-500 text-xs hover:text-red-700"
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 8a6 6 0 1 0 1.2-3.6" /><path d="M2 3.5V8h4.5" />
                    </svg>
                    Reiniciar
                </button>
                <div className="flex gap-2">
                    <div style={{ position: "relative" }}>
                        <button
                            ref={movBtnRef}
                            onClick={() => setShowMovPopover((v) => !v)}
                            className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            + Movimiento
                        </button>
                        {showMovPopover && (
                            <MovimientoPopover
                                anchorRef={movBtnRef}
                                onConfirm={handleMovConfirm}
                                onClose={() => setShowMovPopover(false)}
                            />
                        )}
                    </div>
                    <button
                        onClick={() => setModal("product")}
                        className="px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        + Producto
                        <span className="ml-1.5 opacity-50 text-[10px]">F1</span>
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table ref={tableRef} className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 px-1 py-1 text-center text-[11px] font-medium text-gray-500 uppercase w-8">#</th>
                            <th className="border border-gray-200 px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase min-w-[220px]">Producto</th>
                            <th className="border border-gray-200 px-2 py-1 text-center text-[11px] font-medium text-gray-500 uppercase min-w-[75px]">Inv. ant.</th>
                            {movimientos.map((m) => (
                                <th key={m.id}
                                    className={`border border-gray-200 px-2 py-1 text-center text-[11px] font-medium uppercase whitespace-nowrap min-w-[75px] ${m.tipo === "carga" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    <div className="flex items-center justify-center gap-1">
                                        {m.name}
                                        <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${m.tipo === "carga" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"}`}>
                                            {m.tipo === "carga" ? "+" : "−"}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setMovimientos((prev) => prev.filter((x) => x.id !== m.id));
                                                setFilas((prev) => prev.map((f) => {
                                                    const movs = { ...f.movs };
                                                    delete movs[m.id];
                                                    return { ...f, movs };
                                                }));
                                            }}
                                            className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors leading-none text-[11px]"
                                            title="Eliminar columna"
                                        >⊖</button>
                                    </div>
                                </th>
                            ))}
                            <th className="border border-gray-200 px-2 py-1 text-center text-[11px] font-medium text-gray-500 uppercase bg-gray-50 min-w-[60px]">Total</th>
                            <th className="border border-gray-200 px-2 py-1 text-center text-[11px] font-medium text-gray-500 uppercase min-w-[75px]">Retorno</th>
                            <th className="border border-gray-200 px-2 py-1 text-center text-[11px] font-medium uppercase bg-yellow-50 text-yellow-700 min-w-[60px]">Ventas</th>
                            <th className="border border-gray-200 w-6" />
                        </tr>
                    </thead>
                    <tbody>
                        {filas.length === 0 ? (
                            <tr>
                                <td colSpan={5 + movimientos.length}
                                    className="border border-gray-200 py-8 text-center text-xs text-gray-400">
                                    Sin productos. Pulsa{" "}
                                    <kbd className="px-1 py-0.5 text-[10px] bg-gray-100 rounded border border-gray-300">F1</kbd>
                                    {" "}o usa &ldquo;+ Producto&rdquo; para agregar.
                                </td>
                            </tr>
                        ) : (
                            filas.map((f, rowIdx) => (
                                <tr key={f._id} className="hover:bg-gray-50/60">
                                    <td className="border border-gray-200 text-center text-[11px] text-gray-400 py-0.5">{rowIdx + 1}</td>
                                    <td className="border border-gray-200 px-2 py-1">
                                        <div className="font-medium text-xs leading-tight">{f.name}</div>
                                      
                                    </td>

                                    {/* col 0 → invAnt */}
                                    <td className="border border-gray-200 p-0">
                                        <NumInput
                                            value={f.invAnt}
                                            onChange={(v) => updateFila(f._id, "invAnt", v)}
                                            rowIdx={rowIdx} colIdx={0}
                                            totalRows={totalRows} totalCols={totalCols}
                                            tableRef={tableRef}
                                        />
                                    </td>

                                    {/* col 1..N → movimientos */}
                                    {movimientos.map((m, mIdx) => (
                                        <td key={m.id}
                                            className={`border border-gray-200 p-0 ${m.tipo === "carga" ? "bg-green-50" : "bg-red-50"}`}>
                                            <NumInput
                                                value={f.movs[m.id] ?? ""}
                                                onChange={(v) => updateMov(f._id, m.id, v)}
                                                rowIdx={rowIdx} colIdx={1 + mIdx}
                                                totalRows={totalRows} totalCols={totalCols}
                                                tableRef={tableRef}
                                            />
                                        </td>
                                    ))}

                                    {/* Total — solo lectura */}
                                    <td className="border border-gray-200 px-2 py-1 text-center text-xs font-medium bg-gray-50 text-gray-700">
                                        {calcTotal(f, movimientos)}
                                    </td>

                                    {/* col N+1 → retorno */}
                                    <td className="border border-gray-200 p-0">
                                        <NumInput
                                            value={f.retorno}
                                            onChange={(v) => updateFila(f._id, "retorno", v)}
                                            rowIdx={rowIdx} colIdx={1 + movimientos.length}
                                            totalRows={totalRows} totalCols={totalCols}
                                            tableRef={tableRef}
                                        />
                                    </td>

                                    <td className="border border-gray-200 px-2 py-1 text-center text-xs font-medium bg-yellow-50 text-yellow-700">
                                        {calcVentas(f, movimientos)}
                                    </td>
                                    <td className="border border-gray-200 text-center">
                                        <button
                                            onClick={() => delFila(f._id)}
                                            className="text-gray-300 hover:text-red-500 text-sm leading-none px-1 transition-colors"
                                            title="Eliminar fila"
                                        >⊖</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                    {filas.length > 0 && (
                        <tfoot>
                            <tr className="bg-gray-50 font-medium">
                                <td colSpan={2} className="border border-gray-200 px-2 py-1 text-[11px] text-gray-500 uppercase">Totales</td>
                                <td className="border border-gray-200 px-2 py-1 text-center text-xs">{sumCol("invAnt")}</td>
                                {movimientos.map((m) => (
                                    <td key={m.id}
                                        className={`border border-gray-200 px-2 py-1 text-center text-xs ${m.tipo === "carga" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
                                        {sumMov(m.id)}
                                    </td>
                                ))}
                                <td className="border border-gray-200 px-2 py-1 text-center text-xs bg-gray-100">{sumTotal}</td>
                                <td className="border border-gray-200 px-2 py-1 text-center text-xs">{sumCol("retorno")}</td>
                                <td className="border border-gray-200 px-2 py-1 text-center text-xs bg-yellow-100 text-yellow-800">{sumVentas}</td>
                                <td className="border border-gray-200" />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <button
                onClick={() => setModal("product")}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 transition-colors"
            >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Agregar producto
            </button>

            {modal === "product" && (
                <ProductSearchModal
                    catalog={catalog}
                    currentIds={currentIds}
                    onConfirm={handleProductConfirm}
                    onClose={() => setModal(null)}
                />
            )}
            {cargaCtx && cargaFila && cargaMov && (
                <CargaPickerModal
                    movimiento={cargaMov}
                    fila={cargaFila}
                    onConfirm={handleCargaConfirm}
                    onClose={() => setCargaCtx(null)}
                />
            )}
        </>
    );
}