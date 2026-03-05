import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Search, 
  FileDown, 
  UserCheck, 
  FileText, 
  Trash2, 
  PlusCircle,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportTable = () => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState(["Tipo Documento", "No.", "Fecha", "ID", "Cliente", "Total", "Vendedor", "Término"]);
    const [filterText, setFilterText] = useState('');
    const [selectedVendedor, setSelectedVendedor] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Estado para el nuevo registro manual
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
                    id_interno: Math.random().toString(36).substr(2, 9), // ID único para manejo en React
                    "Tipo Documento": currentDocType,
                    "No.": row[0],
                    "Fecha": row[4],
                    "ID": row[8],
                    "Cliente": row[10],
                    "Total": parseFloat(String(row[13]).replace(/[^0-9.-]+/g,"")) || 0,
                    "Vendedor": row[15] ? row[15].trim() : "SIN ASIGNAR",
                    "Término": terminoNormalizado
                };

                if (rowObj["No."] !== "" && !isNaN(rowObj["No."])) processedData.push(rowObj);
            }
        });
        setData(processedData);
    };

    // --- ACCIONES MANUALES ---
    const handleDeleteRow = (id) => {
        setData(data.filter(item => item.id_interno !== id));
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

    // --- VISTA PREVIA PDF (NUEVA PESTAÑA) ---
    const previewPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text('JALEAS DEL PINO SA DE CV', 14, 15);
        doc.setFontSize(11);
        doc.text(`Vendedor: ${selectedVendedor || 'TODOS'} | Fecha Reporte: ${new Date().toLocaleDateString()}`, 14, 25);

        const grupos = filteredData.reduce((acc, item) => {
            const t = item["Término"];
            if (!acc[t]) acc[t] = [];
            acc[t].push(item);
            return acc;
        }, {});

        let currentY = 35;

        Object.keys(grupos).sort().forEach((termino) => {
            const itemsGrupo = grupos[termino];
            const subtotal = itemsGrupo.reduce((s, i) => s + i.Total, 0);

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`TÉRMINO: ${termino}`, 14, currentY);

            autoTable(doc, {
                startY: currentY + 2,
                head: [["Tipo Doc.", "No.", "Fecha", "ID", "Cliente", "Vendedor", "Total"]],
                body: itemsGrupo.map(item => [item["Tipo Documento"], item["No."], item["Fecha"], item["ID"], item["Cliente"], item["Vendedor"], `$${item["Total"].toLocaleString('en-US', { minimumFractionDigits: 2 })}`]),
                theme: 'grid',
                headStyles: { fillColor: [44, 62, 80] },
                styles: { fontSize: 8 },
                columnStyles: { 6: { halign: 'right' } },
                foot: [[{ content: `SUBTOTAL ${termino}:`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, styles: { halign: 'right', fontStyle: 'bold' } }]],
            });
            currentY = doc.lastAutoTable.finalY + 12;
        });

        doc.setFontSize(14);
        doc.text(`TOTAL GENERAL: $${totalVentaFiltrada.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, currentY);
        
        // ABRIR EN NUEVA PESTAÑA
        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <div className="p-4 bg-slate-100 min-h-screen font-sans text-[11px]">
            <div className="max-w-[1500px] mx-auto">
                {/* HEADER PANEL */}
                <div className="bg-white p-5 rounded-t-xl shadow-lg border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="text-center lg:text-left">
                            <h1 className="text-2xl font-black text-indigo-900 leading-tight">JALEAS DEL PINO</h1>
                            <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase">Sistema de Gestión Fiscal</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                            <select className="border p-2 rounded-lg font-bold bg-gray-50 text-indigo-900" value={selectedVendedor} onChange={(e) => setSelectedVendedor(e.target.value)}>
                                <option value="">Todos los Vendedores</option>
                                {vendedoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>

                            <input type="text" placeholder="Buscar..." className="border p-2 rounded-lg w-48" onChange={(e) => setFilterText(e.target.value)} />

                            <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer flex items-center gap-2 transition-all">
                                <FileDown size={16} /> IMPORTAR EXCEL
                                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                            </label>

                            <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                                <PlusCircle size={16} /> AGREGAR
                            </button>

                            <button onClick={previewPDF} disabled={data.length === 0} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:bg-gray-300 transition-all shadow-md">
                                <FileText size={16} /> VISTA PREVIA PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white shadow-xl overflow-hidden rounded-b-xl">
                    <div className="overflow-x-auto max-h-[70vh]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-800 text-white text-[10px] uppercase">
                                <tr>
                                    <th className="px-4 py-3">Tipo Doc</th>
                                    <th className="px-4 py-3">No.</th>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3">Vendedor</th>
                                    <th className="px-4 py-3">Término</th>
                                    <th className="px-4 py-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((row) => (
                                    <tr key={row.id_interno} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-2 font-bold text-indigo-700">{row["Tipo Documento"]}</td>
                                        <td className="px-4 py-2 font-mono">{row["No."]}</td>
                                        <td className="px-4 py-2 text-gray-500">{row["Fecha"]}</td>
                                        <td className="px-4 py-2 font-semibold text-gray-800 uppercase">{row["Cliente"]}</td>
                                        <td className="px-4 py-2 font-black text-emerald-700 text-right">$ {row["Total"].toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-2 text-gray-500 text-[9px] uppercase font-bold">{row["Vendedor"]}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${row["Término"] === 'CONTADO' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {row["Término"]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleDeleteRow(row.id_interno)} className="text-rose-400 hover:text-rose-600 transition-colors p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* MODAL AGREGAR MANUAL */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2"><PlusCircle size={20}/> Nuevo Registro Manual</h2>
                                <button onClick={() => setShowAddModal(false)}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleAddManual} className="p-6 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre del Cliente</label>
                                    <input required className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-1 text-sm" value={newRow.Cliente} onChange={e => setNewRow({...newRow, Cliente: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">No. Documento</label>
                                    <input required className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-1 text-sm" value={newRow["No."]} onChange={e => setNewRow({...newRow, "No.": e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Monto Total ($)</label>
                                    <input required type="number" step="0.01" className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-1 text-sm" value={newRow.Total} onChange={e => setNewRow({...newRow, Total: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Vendedor</label>
                                    <input required className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-1 text-sm" value={newRow.Vendedor} onChange={e => setNewRow({...newRow, Vendedor: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase">Término</label>
                                    <select className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-1 text-sm" value={newRow["Término"]} onChange={e => setNewRow({...newRow, "Término": e.target.value})}>
                                        <option value="CONTADO">CONTADO</option>
                                        <option value="CRÉDITO">CRÉDITO</option>
                                    </select>
                                </div>
                                <button type="submit" className="col-span-2 bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-indigo-700 shadow-lg transition-all">GUARDAR REGISTRO</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportTable;