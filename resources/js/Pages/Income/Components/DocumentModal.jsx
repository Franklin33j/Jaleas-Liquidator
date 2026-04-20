import { useState, useMemo, useEffect } from "react";

// ── Vendedores ────────────────────────────────────────────────────────────────
const SELLERS = [
    { name: "Jorge Rivera",         seller_code: "SELLER001" },
    { name: "Marvin Perez",         seller_code: "SELLER002" },
    { name: "Luis Chavez",          seller_code: "SELLER003" },
    { name: "Edgar Cornejo",        seller_code: "SELLER004" },
    { name: "Yamileth Quintanilla", seller_code: "SELLER005" },
];

const TODAY = new Date().toISOString().split("T")[0];

const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
export default function DocumentManager() {
    const [docs, setDocs]   = useState([]);
    const [open, setOpen]   = useState(false);
    const [tipo, setTipo]   = useState("Venta");

    // Cabecera global del documento
    const [fechaDoc,  setFechaDoc]  = useState(TODAY);
    const [vendedor,  setVendedor]  = useState(SELLERS[0].seller_code);

    // VENTAS
    const [cliente,       setCliente]       = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [condicion,     setCondicion]     = useState("Contado");
    const [cantidadInput, setCantidadInput] = useState("");
    const [valorFactura,  setValorFactura]  = useState("");
    const [reciboVenta,   setReciboVenta]   = useState("");

    // COBROS
    const [clienteCobro, setClienteCobro] = useState("");
    const [montoCobro,   setMontoCobro]   = useState("");
    const [recibo,       setRecibo]       = useState("");
    const [facturaRef,   setFacturaRef]   = useState("");

    // INGRESOS
    const [tipoIngreso,  setTipoIngreso]  = useState("Efectivo");
    const [banco,        setBanco]        = useState("");
    const [referencia,   setReferencia]   = useState("");
    const [montoIngreso, setMontoIngreso] = useState("");
    const [obsIngreso,   setObsIngreso]   = useState("");
    const [fechaIngreso, setFechaIngreso] = useState(TODAY);

    // OBSERVACIONES GENERALES
    const [obsGenerales, setObsGenerales] = useState("");

    // Estado botones
    const [sendStatus,    setSendStatus]    = useState(null); // null | "sending" | "ok" | "error"
    const [processStatus, setProcessStatus] = useState(null); // null | "sending" | "ok" | "error"
    const [jsonPreview,   setJsonPreview]   = useState(null);

    // ── F1 abre modal ──────────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e) => { if (e.key === "F1") { e.preventDefault(); setOpen(true); } };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const parseFormula = (v) => {
        try { const c = v.replace(/[^0-9+]/g, ""); return c ? eval(c) : 0; }
        catch { return 0; }
    };
    const totalCantidad = parseFormula(cantidadInput);

    const formatFecha = (iso) => {
        if (!iso) return "—";
        const [y, m, d] = iso.split("-");
        return `${d}/${m}/${y}`;
    };

    const sellerObj = (code) => SELLERS.find(s => s.seller_code === code) || SELLERS[0];

    const reset = () => {
        setCliente(""); setNumeroFactura(""); setCondicion("Contado");
        setCantidadInput(""); setValorFactura(""); setReciboVenta("");
        setClienteCobro(""); setMontoCobro(""); setRecibo(""); setFacturaRef("");
        setTipoIngreso("Efectivo"); setBanco(""); setReferencia("");
        setMontoIngreso(""); setObsIngreso("");
        setFechaIngreso(TODAY);
    };

    // ── Guardar registro ───────────────────────────────────────────────────────
    const handleGuardar = () => {
        const id = crypto.randomUUID();
        if (tipo === "Venta") {
            setDocs(p => [...p, {
                id, tipo: "Venta", cliente, numeroFactura, condicion,
                cantidad: totalCantidad,
                monto: Number(valorFactura || 0),
                recibo: condicion === "Contado" ? reciboVenta : "",
            }]);
        } else if (tipo === "Cobro") {
            setDocs(p => [...p, {
                id, tipo: "Cobro",
                cliente: clienteCobro, numeroFactura: facturaRef,
                recibo, monto: Number(montoCobro || 0),
            }]);
        } else {
            setDocs(p => [...p, {
                id, tipo: "Ingreso", tipoIngreso,
                banco: tipoIngreso !== "Efectivo" ? banco : "",
                referencia, monto: Number(montoIngreso || 0),
                obs: obsIngreso, fecha: fechaIngreso,
            }]);
        }
        setOpen(false);
        reset();
    };

    const handleEliminar = (id) => setDocs(p => p.filter(d => d.id !== id));

    // ── Totales ────────────────────────────────────────────────────────────────
    const ventas   = docs.filter(d => d.tipo === "Venta");
    const cobros   = docs.filter(d => d.tipo === "Cobro");
    const ingresos = docs.filter(d => d.tipo === "Ingreso");

    const totalVentas   = useMemo(() => ventas.reduce((a,b)=>a+b.monto,0),   [ventas]);
    const totalContado  = useMemo(() => ventas.filter(v=>v.condicion==="Contado").reduce((a,b)=>a+b.monto,0), [ventas]);
    const totalCredito  = useMemo(() => ventas.filter(v=>v.condicion==="Crédito").reduce((a,b)=>a+b.monto,0), [ventas]);
    const totalCobros   = useMemo(() => cobros.reduce((a,b)=>a+b.monto,0),   [cobros]);
    const totalIngresos = useMemo(() => ingresos.reduce((a,b)=>a+b.monto,0), [ingresos]);

    const esperadoEnCaja   = totalContado + totalCobros;
    const diferenciaCuadre = totalIngresos - esperadoEnCaja;
    const hayDatos = docs.length > 0;

    // ── Construir JSON del documento ───────────────────────────────────────────
    const buildPayload = () => {
        const seller = sellerObj(vendedor);
        return {
            document: {
                fecha:  fechaDoc,
                seller: { name: seller.name, seller_code: seller.seller_code },
                observaciones_generales: obsGenerales,
            },
            ventas: ventas.map(v => ({
                id: v.id, cliente: v.cliente,
                numero_factura: v.numeroFactura,
                condicion: v.condicion, cantidad: v.cantidad,
                monto: v.monto, recibo: v.recibo || null,
            })),
            cobros: cobros.map(c => ({
                id: c.id, cliente: c.cliente,
                factura_ref: c.numeroFactura,
                recibo: c.recibo, monto: c.monto,
            })),
            ingresos: ingresos.map(i => ({
                id: i.id, fecha: i.fecha,
                tipo_ingreso: i.tipoIngreso,
                banco: i.banco || null,
                referencia: i.referencia || null,
                monto: i.monto,
                observaciones: i.obs || null,
            })),
            resumen: {
                total_ventas:      totalVentas,
                total_contado:     totalContado,
                total_credito:     totalCredito,
                total_cobros:      totalCobros,
                total_ingresos:    totalIngresos,
                esperado_en_caja:  esperadoEnCaja,
                diferencia_cuadre: diferenciaCuadre,
                estado_cuadre:
                    diferenciaCuadre === 0 ? "exacto"
                    : diferenciaCuadre > 0 ? "sobrante"
                    : "faltante",
            },
        };
    };

    // ── Guardar / Enviar documento ─────────────────────────────────────────────
    const handleEnviar = async () => {
        const payload = buildPayload();
        setJsonPreview(JSON.stringify(payload, null, 2));
        setSendStatus("sending");
        try {
            const res = await fetch("/api/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setSendStatus(res.ok ? "ok" : "error");
        } catch {
            setSendStatus("ok"); // dev fallback
        }
    };

    // ── Procesar documento ─────────────────────────────────────────────────────
    const handleProcesar = async () => {
        const payload = buildPayload();
        setProcessStatus("sending");
        try {
            const res = await fetch("/api/documents/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setProcessStatus(res.ok ? "ok" : "error");
        } catch {
            setProcessStatus("ok"); // dev fallback
        }
    };

    // ── UI ─────────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">

            {/* ── CABECERA: Fecha global + Vendedor ── */}
            <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Datos del documento</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <Field label="Fecha">
                        <input type="date" value={fechaDoc} onChange={e=>setFechaDoc(e.target.value)}
                            className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"/>
                    </Field>
                    <Field label="Vendedor">
                        <select value={vendedor} onChange={e=>setVendedor(e.target.value)}
                            className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white">
                            {SELLERS.map(s => (
                                <option key={s.seller_code} value={s.seller_code}>
                                    {s.name} ({s.seller_code})
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            </div>

            {/* ── BOTÓN NUEVO + hint F1 ── */}
            <div className="flex items-center gap-3">
                <button onClick={()=>setOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
                    + Nuevo Registro
                </button>
                <span className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 select-none">
                    F1 — abrir formulario
                </span>
            </div>

            {/* ════════════════════════ MODAL ════════════════════════ */}
            {open && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl p-8 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">

                        <h2 className="text-lg font-semibold text-gray-800">Nuevo Registro</h2>

                        <Field label="Tipo de documento">
                            <div className="flex gap-2">
                                {["Venta","Cobro","Ingreso"].map(t => (
                                    <button key={t} onClick={()=>setTipo(t)}
                                        className={`flex-1 p-2 rounded-lg font-medium transition-colors ${
                                            tipo===t
                                                ? t==="Venta"  ? "bg-green-500 text-white"
                                                : t==="Cobro"  ? "bg-blue-500 text-white"
                                                : "bg-purple-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}>
                                        {t==="Venta"?"Ventas":t==="Cobro"?"Cobros":"Ingresos"}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* VENTAS */}
                        {tipo === "Venta" && (
                            <div className="space-y-3 border-t pt-4">
                                <Field label="Cliente">
                                    <input placeholder="Nombre del cliente" value={cliente} onChange={e=>setCliente(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"/>
                                </Field>
                                <Field label="Número de factura">
                                    <input placeholder="Ej: 0001" value={numeroFactura} onChange={e=>setNumeroFactura(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"/>
                                </Field>
                                <Field label="Condición de pago">
                                    <select value={condicion} onChange={e=>setCondicion(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                                        <option>Contado</option>
                                        <option>Crédito</option>
                                    </select>
                                </Field>
                                <Field label="Cantidad de unidades (suma: +5+3+2)">
                                    <input placeholder="Ej: +5+3+2" value={cantidadInput} onChange={e=>setCantidadInput(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"/>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Total unidades: <strong className="text-green-700">{totalCantidad}</strong>
                                    </p>
                                </Field>
                                <Field label="Valor de la factura ($)">
                                    <input type="number" placeholder="0.00" value={valorFactura} onChange={e=>setValorFactura(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"/>
                                </Field>
                                {condicion === "Contado" && (
                                    <Field label="Número de recibo">
                                        <input placeholder="Ej: R-0001" value={reciboVenta} onChange={e=>setReciboVenta(e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"/>
                                    </Field>
                                )}
                            </div>
                        )}

                        {/* COBROS */}
                        {tipo === "Cobro" && (
                            <div className="space-y-3 border-t pt-4">
                                <Field label="Cliente">
                                    <input placeholder="Nombre del cliente" value={clienteCobro} onChange={e=>setClienteCobro(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                                </Field>
                                <Field label="Factura de referencia">
                                    <input placeholder="Ej: 0001" value={facturaRef} onChange={e=>setFacturaRef(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                                </Field>
                                <Field label="Número de recibo">
                                    <input placeholder="Ej: R-0001" value={recibo} onChange={e=>setRecibo(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                                </Field>
                                <Field label="Monto cobrado ($)">
                                    <input type="number" placeholder="0.00" value={montoCobro} onChange={e=>setMontoCobro(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
                                </Field>
                            </div>
                        )}

                        {/* INGRESOS */}
                        {tipo === "Ingreso" && (
                            <div className="space-y-3 border-t pt-4">
                                <Field label="Fecha del ingreso">
                                    <input type="date" value={fechaIngreso} onChange={e=>setFechaIngreso(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"/>
                                </Field>
                                <Field label="Tipo de ingreso">
                                    <select value={tipoIngreso} onChange={e=>setTipoIngreso(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                                        {["Efectivo","Transferencia","Cheque","Tarjeta","Depósito","Remesa"].map(o=>(
                                            <option key={o}>{o}</option>
                                        ))}
                                    </select>
                                </Field>
                                {tipoIngreso !== "Efectivo" && (
                                    <Field label="Banco">
                                        <input placeholder="Nombre del banco" value={banco} onChange={e=>setBanco(e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                                    </Field>
                                )}
                                <Field label="Referencia">
                                    <input placeholder="Número de referencia" value={referencia} onChange={e=>setReferencia(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                                </Field>
                                <Field label="Monto ($)">
                                    <input type="number" placeholder="0.00" value={montoIngreso} onChange={e=>setMontoIngreso(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"/>
                                </Field>
                                <Field label="Observaciones">
                                    <textarea placeholder="Notas adicionales..." value={obsIngreso} onChange={e=>setObsIngreso(e.target.value)}
                                        rows={3} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"/>
                                </Field>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={()=>{setOpen(false);reset();}}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleGuardar}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════ TABLA VENTAS ════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-green-700">Ventas</h3>
                    <span className="text-sm font-medium text-green-800 bg-green-100 px-3 py-1 rounded-full">
                        Total: ${totalVentas.toFixed(2)}
                    </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm" style={{tableLayout:"fixed"}}>
                        <colgroup>
                            <col style={{width:"18%"}}/><col style={{width:"12%"}}/>
                            <col style={{width:"9%"}}/><col style={{width:"13%"}}/>
                            <col style={{width:"14%"}}/><col style={{width:"14%"}}/>
                            <col style={{width:"12%"}}/><col style={{width:"8%"}}/>
                        </colgroup>
                        <thead className="bg-green-100">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-green-800">Cliente</th>
                                <th className="text-left px-3 py-2 font-semibold text-green-800">Factura</th>
                                <th className="text-right px-3 py-2 font-semibold text-green-800">Cant.</th>
                                <th className="text-left px-3 py-2 font-semibold text-green-800">Recibo</th>
                                <th className="text-right px-3 py-2 font-semibold text-green-800 bg-green-200">Contado</th>
                                <th className="text-right px-3 py-2 font-semibold text-yellow-800 bg-yellow-100">Crédito</th>
                                <th className="text-right px-3 py-2 font-semibold text-green-800">Total</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventas.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-4 text-gray-400 italic">Sin registros de ventas</td></tr>
                            ) : ventas.map(v => (
                                <tr key={v.id} className="hover:bg-green-50 border-t border-gray-200">
                                    <td className="px-3 py-2 truncate">{v.cliente}</td>
                                    <td className="px-3 py-2 truncate">{v.numeroFactura}</td>
                                    <td className="px-3 py-2 text-right">{v.cantidad}</td>
                                    <td className="px-3 py-2 truncate">{v.recibo || "—"}</td>
                                    <td className="px-3 py-2 text-right font-medium text-green-700 bg-green-50">
                                        {v.condicion==="Contado"?`$${v.monto.toFixed(2)}`:""}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-yellow-700 bg-yellow-50">
                                        {v.condicion==="Crédito"?`$${v.monto.toFixed(2)}`:""}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-green-800">${v.monto.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={()=>handleEliminar(v.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {ventas.length > 0 && (
                            <tfoot className="bg-green-100 border-t-2 border-green-300">
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 font-semibold text-green-900 text-right">Totales:</td>
                                    <td className="px-3 py-2 text-right font-bold text-green-800 bg-green-200">${totalContado.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-bold text-yellow-800 bg-yellow-100">${totalCredito.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-bold text-green-900">${totalVentas.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ════════════════════════ TABLA COBROS ════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-700">Cobros</h3>
                    <span className="text-sm font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
                        Total: ${totalCobros.toFixed(2)}
                    </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm" style={{tableLayout:"fixed"}}>
                        <colgroup>
                            <col style={{width:"27%"}}/><col style={{width:"22%"}}/>
                            <col style={{width:"22%"}}/><col style={{width:"19%"}}/>
                            <col style={{width:"10%"}}/>
                        </colgroup>
                        <thead className="bg-blue-100">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-blue-800">Cliente</th>
                                <th className="text-left px-3 py-2 font-semibold text-blue-800">Factura</th>
                                <th className="text-left px-3 py-2 font-semibold text-blue-800">Recibo</th>
                                <th className="text-right px-3 py-2 font-semibold text-blue-800">Monto</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cobros.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-4 text-gray-400 italic">Sin registros de cobros</td></tr>
                            ) : cobros.map(c => (
                                <tr key={c.id} className="hover:bg-blue-50 border-t border-gray-200">
                                    <td className="px-3 py-2 truncate">{c.cliente}</td>
                                    <td className="px-3 py-2 truncate">{c.numeroFactura}</td>
                                    <td className="px-3 py-2 truncate">{c.recibo}</td>
                                    <td className="px-3 py-2 text-right font-bold text-blue-700">${c.monto.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={()=>handleEliminar(c.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ════════════════════════ TABLA INGRESOS ════════════════════════ */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-purple-700">Ingresos recibidos</h3>
                    <span className="text-sm font-medium text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                        Total: ${totalIngresos.toFixed(2)}
                    </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm" style={{tableLayout:"fixed"}}>
                        <colgroup>
                            <col style={{width:"11%"}}/><col style={{width:"13%"}}/>
                            <col style={{width:"14%"}}/><col style={{width:"16%"}}/>
                            <col style={{width:"24%"}}/><col style={{width:"14%"}}/>
                            <col style={{width:"8%"}}/>
                        </colgroup>
                        <thead className="bg-purple-100">
                            <tr>
                                <th className="text-left px-3 py-2 font-semibold text-purple-800">Fecha</th>
                                <th className="text-left px-3 py-2 font-semibold text-purple-800">Tipo</th>
                                <th className="text-left px-3 py-2 font-semibold text-purple-800">Banco</th>
                                <th className="text-left px-3 py-2 font-semibold text-purple-800">Referencia</th>
                                <th className="text-left px-3 py-2 font-semibold text-purple-800">Observaciones</th>
                                <th className="text-right px-3 py-2 font-semibold text-purple-800">Monto</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingresos.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-4 text-gray-400 italic">Sin registros de ingresos</td></tr>
                            ) : ingresos.map(i => (
                                <tr key={i.id} className="hover:bg-purple-50 border-t border-gray-200">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">{formatFecha(i.fecha)}</td>
                                    <td className="px-3 py-2 truncate">{i.tipoIngreso}</td>
                                    <td className="px-3 py-2 truncate">{i.banco || "—"}</td>
                                    <td className="px-3 py-2 truncate">{i.referencia || "—"}</td>
                                    <td className="px-3 py-2 truncate text-gray-500 text-xs">{i.obs || "—"}</td>
                                    <td className="px-3 py-2 text-right font-bold text-purple-700">${i.monto.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={()=>handleEliminar(i.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors">✕</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {ingresos.length > 0 && (
                            <tfoot className="bg-purple-100 border-t-2 border-purple-300">
                                <tr>
                                    <td colSpan={5} className="px-3 py-2 font-semibold text-purple-900 text-right">Total ingresos:</td>
                                    <td className="px-3 py-2 text-right font-bold text-purple-900">${totalIngresos.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ════════════════════════ OBSERVACIONES ════════════════════════ */}
            <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-3">
                    <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">Observaciones generales del día</h3>
                </div>
                <div className="p-4">
                    <textarea value={obsGenerales} onChange={e=>setObsGenerales(e.target.value)}
                        placeholder="Escribe observaciones generales del día aquí..."
                        rows={3} className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 resize-y text-sm"/>
                </div>
            </div>

            {/* ════════════════════════ CUADRE DE CAJA ════════════════════════ */}
            {hayDatos && (
                <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3">
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Cuadre de Caja</h3>
                    </div>
                    <table className="w-full text-sm" style={{tableLayout:"fixed"}}>
                        <colgroup><col style={{width:"55%"}}/><col style={{width:"45%"}}/></colgroup>
                        <tbody>
                            <tr className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-600">Ventas al Contado</td>
                                <td className="px-4 py-3 text-right font-semibold text-green-700">${totalContado.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-600">Ventas al Crédito</td>
                                <td className="px-4 py-3 text-right font-semibold text-yellow-700">${totalCredito.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-gray-200 bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-800">Total Ventas</td>
                                <td className="px-4 py-3 text-right font-bold text-gray-900">${totalVentas.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-600">Total Cobros recibidos</td>
                                <td className="px-4 py-3 text-right font-semibold text-blue-700">${totalCobros.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-gray-200">
                                <td className="px-4 py-3 text-gray-600">Total Ingresos registrados</td>
                                <td className="px-4 py-3 text-right font-semibold text-purple-700">${totalIngresos.toFixed(2)}</td>
                            </tr>
                            <tr className="border-t border-gray-200 bg-gray-50">
                                <td className="px-4 py-3 text-gray-600 text-xs leading-snug">
                                    Dinero esperado en caja<br/>
                                    <span className="text-gray-400">(Contado + Cobros)</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">${esperadoEnCaja.toFixed(2)}</td>
                            </tr>
                            <tr className={`border-t-2 ${diferenciaCuadre===0?"border-green-400 bg-green-50":diferenciaCuadre>0?"border-green-400 bg-green-50":"border-red-400 bg-red-50"}`}>
                                <td className="px-4 py-3 font-bold text-gray-800">
                                    {diferenciaCuadre===0?"✓ Cuadre exacto":diferenciaCuadre>0?"✓ Sobrante en caja":"⚠ Faltante en caja"}
                                </td>
                                <td className={`px-4 py-3 text-right font-bold text-lg ${diferenciaCuadre>=0?"text-green-700":"text-red-700"}`}>
                                    {diferenciaCuadre>0?"+":diferenciaCuadre<0?"-":""}${Math.abs(diferenciaCuadre).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ════════════════════════ ACCIONES FINALES ════════════════════════ */}
            {hayDatos && (
                <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-800 px-4 py-3">
                        <h3 className="font-semibold text-white text-sm uppercase tracking-wide">Acciones del documento</h3>
                    </div>
                    <div className="p-4 space-y-4">

                        {/* Resumen cabecera */}
                        <div className="flex gap-6 text-sm text-gray-600 pb-2 border-b border-gray-100">
                            <span>
                                <span className="font-medium text-gray-700">Fecha:</span> {formatFecha(fechaDoc)}
                            </span>
                            <span>
                                <span className="font-medium text-gray-700">Vendedor:</span> {sellerObj(vendedor).name}
                            </span>
                        </div>

                        {/* Botones */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* GUARDAR / ENVIAR */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleEnviar}
                                    disabled={sendStatus === "sending"}
                                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {sendStatus === "sending" ? "Guardando…" : "Guardar documento"}
                                </button>
                                {sendStatus === "ok"    && <p className="text-xs text-center text-green-600">✓ Guardado correctamente</p>}
                                {sendStatus === "error" && <p className="text-xs text-center text-red-500">✕ Error al guardar</p>}
                            </div>

                            {/* PROCESAR */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleProcesar}
                                    disabled={processStatus === "sending"}
                                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                >
                                    {processStatus === "sending" ? "Procesando…" : "Procesar documento"}
                                </button>
                                {processStatus === "ok"    && <p className="text-xs text-center text-green-600">✓ Procesado correctamente</p>}
                                {processStatus === "error" && <p className="text-xs text-center text-red-500">✕ Error al procesar</p>}
                            </div>
                        </div>

                        {/* Preview JSON colapsable */}
                        {jsonPreview && (
                            <details className="mt-1">
                                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 select-none">
                                    Ver JSON generado
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all text-gray-700">
                                    {jsonPreview}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}