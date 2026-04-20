import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
    FileSpreadsheet,
    Search,
    FileDown,
    FileText,
    Trash2,
    PlusCircle,
    X,
    Edit3,
    Check,
    RotateCcw,
    Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const calcGravado = (total) => total / 1.13;
const calcIVA = (total) => total - total / 1.13;

const ReportTable = () => {
    const [data, setData] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [selectedVendedor, setSelectedVendedor] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

    const [newRow, setNewRow] = useState({
        "Tipo Documento": "Factura",
        "No.": "",
        "Fecha": new Date().toLocaleDateString('en-GB'),
        "ID": "",
        "Cliente": "",
        "Total": "",
        "Vendedor": "",
        "Término": "CONTADO"
    });

    // --- CARGA DE ARCHIVO ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const workSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(workSheet, { header: 1, defval: "" });
            processFormat(rawRows);
        };
        reader.readAsBinaryString(file);
    };

    const processFormat = (rows) => {
        let processedData = [];
        let currentDocType = "N/A";
        let headerFound = false;

        rows.forEach((row) => {
            const cleanRow = row.map(c => String(c).trim()).filter(c => c !== "");
            const rowString = cleanRow.join(" ");
            if (rowString === "") return;
            if (rowString.toLowerCase().includes("documento:")) {
                currentDocType = rowString.split(/documento:/i)[1]?.trim() || "N/A";
                return;
            }
            if (rowString.toLowerCase().includes("no.") && rowString.toLowerCase().includes("fecha")) {
                headerFound = true;
                return;
            }
            if (headerFound && cleanRow.length >= 3) {
                if (rowString.toLowerCase().includes("total")) return;
                const terminoOriginal = String(row[19] || "").trim().toLowerCase();
                let terminoNormalizado = "OTROS";
                if (terminoOriginal.includes("contado")) terminoNormalizado = "CONTADO";
                else if (terminoOriginal.includes("dias") || terminoOriginal.includes("días") || terminoOriginal.includes("credito")) terminoNormalizado = "CRÉDITO";

                const rowObj = {
                    id_interno: Math.random().toString(36).substr(2, 9),
                    "Tipo Documento": currentDocType,
                    "No.": row[0],
                    "Fecha": row[4],
                    "ID": row[8],
                    "Cliente": row[10],
                    "Total": parseFloat(String(row[13]).replace(/[^0-9.-]+/g, "")) || 0,
                    "Vendedor": row[15] ? row[15].trim().toUpperCase() : "SIN ASIGNAR",
                    "Término": terminoNormalizado
                };
                if (rowObj["No."] !== "" && !isNaN(rowObj["No."])) processedData.push(rowObj);
            }
        });
        setData(processedData);
    };

    // --- ACCIONES DE EDICIÓN ---
    const startEdit = (row) => {
        setEditingId(row.id_interno);
        setEditFormData({ ...row });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const saveEdit = () => {
        const updatedData = data.map(item =>
            item.id_interno === editingId ? { ...editFormData, Total: parseFloat(editFormData.Total) || 0 } : item
        );
        setData(updatedData);
        setEditingId(null);
    };

    const handleDeleteRow = (id) => {
        if (window.confirm("¿Estás seguro de eliminar este registro?")) {
            setData(data.filter(item => item.id_interno !== id));
        }
    };

    const handleAddManual = (e) => {
        e.preventDefault();
        const rowToAdd = {
            ...newRow,
            id_interno: Math.random().toString(36).substr(2, 9),
            Total: parseFloat(newRow.Total) || 0,
            Vendedor: newRow.Vendedor.toUpperCase(),
            Cliente: newRow.Cliente.toUpperCase()
        };
        setData([rowToAdd, ...data]);
        setShowAddModal(false);
        setNewRow({ "Tipo Documento": "Factura", "No.": "", "Fecha": new Date().toLocaleDateString('en-GB'), "ID": "", "Cliente": "", "Total": "", "Vendedor": "", "Término": "CONTADO" });
    };

    // --- FILTRADO ---
    const vendedoresUnicos = useMemo(() => [...new Set(data.map(item => item.Vendedor))].sort(), [data]);
    const filteredData = data.filter(item => {
        const matchesText = Object.values(item).some(val => String(val).toLowerCase().includes(filterText.toLowerCase()));
        const matchesVendedor = selectedVendedor === "" || item.Vendedor === selectedVendedor;
        return matchesText && matchesVendedor;
    });

    const totalVentaFiltrada = filteredData.reduce((acc, curr) => acc + curr.Total, 0);
    const totalGravado = calcGravado(totalVentaFiltrada);
    const totalIVA = calcIVA(totalVentaFiltrada);

    // --- VISTA PREVIA PDF ---
    const previewPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');

        const dateParts = reportDate.split("-");
        const formattedReportDate = dateParts.length === 3
            ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
            : reportDate;

        // ── Encabezado ──
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('JALEAS DEL PINO SA DE CV', 14, 16);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Vendedor: ${selectedVendedor || 'TODOS'}`, 14, 24);
        doc.text(`Fecha de reporte: ${formattedReportDate}`, 14, 30);

        // línea separadora
        doc.setDrawColor(180, 180, 180);
        doc.line(14, 33, 283, 33);

        // ── Tablas ──
        const boxY = 37;
        // ── Tablas por término ──
        const grupos = filteredData.reduce((acc, item) => {
            const t = item["Término"];
            if (!acc[t]) acc[t] = [];
            acc[t].push(item);
            return acc;
        }, {});

        let currentY = boxY;

        Object.keys(grupos).sort().forEach((termino) => {
            const itemsGrupo = grupos[termino];
            const subtotal = itemsGrupo.reduce((s, i) => s + i.Total, 0);
            const subGrav = calcGravado(subtotal);
            const subIVA = calcIVA(subtotal);

            // etiqueta de término — texto plano sin caracteres especiales
            const terminoLabel = termino === 'CREDITO' ? 'CREDITO' : termino;
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 58, 95);
            doc.text(`TERMINO: ${terminoLabel}`, 14, currentY + 1);
            doc.setTextColor(0, 0, 0);

            autoTable(doc, {
                startY: currentY + 4,
                head: [[
                    'Tipo Doc.',
                    'No.',
                    'Fecha',
                    'ID',
                    'Cliente',
                    { content: 'Gravado', styles: { halign: 'right' } },
                    { content: 'IVA 13%', styles: { halign: 'right' } },
                    { content: 'Total', styles: { halign: 'right' } },
                ]],
                body: itemsGrupo.map(item => [
                    item["Tipo Documento"],
                    item["No."],
                    item["Fecha"],
                    item["ID"],
                    item["Cliente"],
                    { content: `$${fmt(calcGravado(item.Total))}`, styles: { halign: 'right' } },
                    { content: `$${fmt(calcIVA(item.Total))}`, styles: { halign: 'right' } },
                    { content: `$${fmt(item.Total)}`, styles: { halign: 'right' } },
                ]),
                foot: [[
                    {
                        content: `SUBTOTAL ${terminoLabel}`,
                        colSpan: 5,
                        styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 230, 245], textColor: [30, 58, 95] }
                    },
                    { content: `$${fmt(subGrav)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 230, 245], textColor: [30, 58, 95] } },
                    { content: `$${fmt(subIVA)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 230, 245], textColor: [30, 58, 95] } },
                    { content: `$${fmt(subtotal)}`, styles: { halign: 'right', fontStyle: 'bold', fillColor: [220, 230, 245], textColor: [30, 58, 95] } },
                ]],
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 58, 95],
                    textColor: [255, 255, 255],
                    fontSize: 7,
                    fontStyle: 'bold',
                    cellPadding: 2,
                },
                bodyStyles: {
                    fontSize: 7,
                    cellPadding: 1.5,
                    textColor: [40, 40, 40],
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 255],
                },
                footStyles: {
                    fontSize: 7.5,
                    cellPadding: 2,
                },
                columnStyles: {
                    0: { cellWidth: 28 },
                    1: { cellWidth: 18 },
                    2: { cellWidth: 22 },
                    3: { cellWidth: 22 },
                    4: { cellWidth: 'auto' },
                    5: { cellWidth: 28 },
                    6: { cellWidth: 24 },
                    7: { cellWidth: 28 },
                },
                showFoot: 'lastPage',
            });

            currentY = doc.lastAutoTable.finalY + 10;
        });

        // ── Pie de página: total general ──
        doc.setFillColor(30, 58, 95);
        doc.roundedRect(14, currentY, 269, 14, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL GENERAL:', 18, currentY + 9);
        doc.text(`$${fmt(totalVentaFiltrada)}`, 70, currentY + 9);
        doc.text(`Gravado: $${fmt(totalGravado)}`, 130, currentY + 9);
        doc.text(`IVA 13%: $${fmt(totalIVA)}`, 200, currentY + 9);
        doc.setTextColor(0, 0, 0);

        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <div className="p-4 bg-slate-100 min-h-screen font-sans text-[11px]">
            <div className="max-w-[1600px] mx-auto">
                {/* HEADER PANEL */}
                <div className="bg-white p-5 rounded-t-xl shadow-lg border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl font-black text-indigo-900 leading-tight">JALEAS DEL PINO</h1>
                            <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase italic">Gestión de Documentos Fiscales</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center items-end">
                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Vendedor</label>
                                <select className="border p-2 rounded-lg font-bold bg-gray-50 text-indigo-900 h-9" value={selectedVendedor} onChange={(e) => setSelectedVendedor(e.target.value)}>
                                    <option value="">Todos</option>
                                    {vendedoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Fecha Venta</label>
                                <input
                                    type="date"
                                    className="border p-2 rounded-lg font-bold bg-gray-50 text-indigo-900 h-9"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Búsqueda</label>
                                <input type="text" placeholder="Cliente o No..." className="border p-2 rounded-lg w-44 h-9 shadow-sm" onChange={(e) => setFilterText(e.target.value)} />
                            </div>

                            <label className="bg-slate-700 hover:bg-slate-800 text-white px-4 h-9 rounded-lg font-bold cursor-pointer flex items-center gap-2 transition-all">
                                <FileDown size={16} /> IMPORTAR
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                            </label>

                            <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-9 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md">
                                <PlusCircle size={16} /> NUEVO
                            </button>

                            <button onClick={previewPDF} disabled={data.length === 0} className="bg-rose-600 hover:bg-rose-700 text-white px-4 h-9 rounded-lg font-bold flex items-center gap-2 disabled:bg-gray-300 transition-all shadow-md">
                                <FileText size={16} /> PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* TOTALES DEBAJO DEL HEADER */}
                {filteredData.length > 0 && (
                    <div className="bg-indigo-950 px-6 py-3 flex flex-wrap gap-8 items-center">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Total General</span>
                            <span className="text-lg font-black text-white">${fmt(totalVentaFiltrada)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Gravado</span>
                            <span className="text-lg font-black text-blue-300">${fmt(totalGravado)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest">IVA 13%</span>
                            <span className="text-lg font-black text-purple-300">${fmt(totalIVA)}</span>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Registros</span>
                            <span className="text-lg font-black text-white">{filteredData.length}</span>
                        </div>
                    </div>
                )}

                {/* TABLE SECTION */}
                <div className="bg-white shadow-xl overflow-hidden rounded-b-xl border border-gray-200">
                    <div className="overflow-x-auto max-h-[75vh]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-indigo-950 text-white text-[10px] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-4">Tipo Documento</th>
                                    <th className="px-4 py-4">No.</th>
                                    <th className="px-4 py-4">Fecha</th>
                                    <th className="px-4 py-4">Cliente</th>
                                    <th className="px-4 py-4 text-right">Total</th>
                                    <th className="px-4 py-4">Vendedor</th>
                                    <th className="px-4 py-4">Término</th>
                                    <th className="px-4 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((row) => (
                                    <tr key={row.id_interno} className={`transition-colors ${editingId === row.id_interno ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                                        {editingId === row.id_interno ? (
                                            <>
                                                <td className="px-2 py-2"><input className="w-full border p-1" value={editFormData["Tipo Documento"]} onChange={e => setEditFormData({ ...editFormData, "Tipo Documento": e.target.value })} /></td>
                                                <td className="px-2 py-2"><input className="w-full border p-1" value={editFormData["No."]} onChange={e => setEditFormData({ ...editFormData, "No.": e.target.value })} /></td>
                                                <td className="px-2 py-2"><input className="w-full border p-1" value={editFormData["Fecha"]} onChange={e => setEditFormData({ ...editFormData, "Fecha": e.target.value })} /></td>
                                                <td className="px-2 py-2"><input className="w-full border p-1 uppercase" value={editFormData["Cliente"]} onChange={e => setEditFormData({ ...editFormData, "Cliente": e.target.value })} /></td>
                                                <td className="px-2 py-2"><input type="number" className="w-full border p-1 text-right" value={editFormData["Total"]} onChange={e => setEditFormData({ ...editFormData, "Total": e.target.value })} /></td>
                                                <td className="px-2 py-2"><input className="w-full border p-1 uppercase" value={editFormData["Vendedor"]} onChange={e => setEditFormData({ ...editFormData, "Vendedor": e.target.value })} /></td>
                                                <td className="px-2 py-2">
                                                    <select className="w-full border p-1" value={editFormData["Término"]} onChange={e => setEditFormData({ ...editFormData, "Término": e.target.value })}>
                                                        <option value="CONTADO">CONTADO</option>
                                                        <option value="CRÉDITO">CRÉDITO</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2 text-center flex justify-center gap-1">
                                                    <button onClick={saveEdit} className="text-emerald-600 p-1 hover:bg-emerald-100 rounded"><Check size={18} /></button>
                                                    <button onClick={cancelEdit} className="text-gray-500 p-1 hover:bg-gray-100 rounded"><RotateCcw size={18} /></button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-4 py-3 font-bold text-indigo-700">{row["Tipo Documento"]}</td>
                                                <td className="px-4 py-3 font-mono">{row["No."]}</td>
                                                <td className="px-4 py-3 text-gray-500">{row["Fecha"]}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800 uppercase">{row["Cliente"]}</td>
                                                <td className="px-4 py-3 font-black text-emerald-700 text-right">$ {fmt(row["Total"])}</td>
                                                <td className="px-4 py-3 text-gray-500 font-bold uppercase">{row["Vendedor"]}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row["Término"] === 'CONTADO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {row["Término"]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center flex justify-center gap-2">
                                                    <button onClick={() => startEdit(row)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDeleteRow(row.id_interno)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL AGREGAR */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest"><PlusCircle size={20} /> Nuevo Registro</h2>
                                <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleAddManual} className="p-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">Tipo de Documento</label>
                                    <select className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm bg-transparent" value={newRow["Tipo Documento"]} onChange={e => setNewRow({ ...newRow, "Tipo Documento": e.target.value })}>
                                        <option value="Factura">Factura</option>
                                        <option value="Crédito Fiscal">Crédito Fiscal</option>
                                        <option value="Nota de Crédito">Nota de Crédito</option>
                                        <option value="Ticket">Ticket</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">Nombre del Cliente</label>
                                    <input required placeholder="CLIENTE S.A DE C.V" className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm uppercase" value={newRow.Cliente} onChange={e => setNewRow({ ...newRow, Cliente: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">No. Documento</label>
                                    <input required placeholder="000123" className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm" value={newRow["No."]} onChange={e => setNewRow({ ...newRow, "No.": e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">Total ($)</label>
                                    <input required type="number" step="0.01" className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm" value={newRow.Total} onChange={e => setNewRow({ ...newRow, Total: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">Vendedor</label>
                                    <input required placeholder="NOMBRE VENDEDOR" className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm uppercase" value={newRow.Vendedor} onChange={e => setNewRow({ ...newRow, Vendedor: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-indigo-900 uppercase">Término</label>
                                    <select className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-sm bg-transparent" value={newRow["Término"]} onChange={e => setNewRow({ ...newRow, "Término": e.target.value })}>
                                        <option value="CONTADO">CONTADO</option>
                                        <option value="CRÉDITO">CRÉDITO</option>
                                    </select>
                                </div>
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white font-black py-4 rounded-xl mt-4 hover:bg-indigo-700 shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs">AÑADIR A LA LISTA</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTable;