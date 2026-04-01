import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { 
        padding: 30, 
        fontFamily: 'Helvetica', 
        fontSize: 8, // 👈 un poco más compacto general
        lineHeight: 1.2 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12,
        borderBottom: 2,
        borderBottomColor: '#4f46e5',
        paddingBottom: 6
    },
    headerLeft: {
        flex: 1,
        paddingRight: 10,
    },
    headerRight: {
        width: 150,
        textAlign: 'right',
    },
    appName: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#6b7280',
        marginBottom: 3,
    },
    title: { 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#4f46e5',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 7,
        color: '#6b7280',
    },

    // Columnas
    colId:      { width: '5%' },
    colFecha:   { width: '8%' },
    colCliente: { width: '16%' },
    colRecibo:  { width: '8%' },
    colFactura: { width: '8%' },
    colFacturaMonto: { width: '10%', textAlign: 'right' },
    colMonto:   { width: '10%', textAlign: 'right' },
    colSaldo:   { width: '10%', textAlign: 'right' },
    colEstado:  { width: '8%', textAlign: 'center' },
    colNotas:   { width: '17%' },

    table: { width: "100%", marginTop: 8 },

    tableRow: { 
        flexDirection: "row", 
        borderBottomWidth: 1, 
        borderBottomColor: '#EEE', 
        minHeight: 18, // 👈 filas más compactas
        alignItems: 'center' 
    },

    tableColHeader: { 
        backgroundColor: '#4f46e5', 
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 7.5 // 👈 encabezado ligeramente pequeño
    },

    cell: { 
        padding: 3,
        fontSize: 7 // 👈 👈 ESTE ES EL CAMBIO PRINCIPAL
    },
    
    statusActive:   { color: '#059669', fontWeight: 'bold' },
    statusInactive: { color: '#dc2626', fontWeight: 'bold' },

    notasText: {
        color: '#6b7280',
        fontSize: 6.5, // 👈 más pequeño para notas
    },

    footer: { 
        position: 'absolute', 
        bottom: 20, 
        left: 30, 
        right: 30, 
        textAlign: 'center', 
        fontSize: 7, 
        color: '#999',
        borderTop: 1,
        borderTopColor: '#EEE',
        paddingTop: 5
    }
});

const PaymentPDF = ({ payments, appName, userName }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.appName}>{appName || 'Jaleas del Pino S.A. de C.V.'}</Text>
                    <Text style={styles.title}>REPORTE GENERAL DE PAGOS</Text>
                    <Text style={styles.subtitle}>Gestión Administrativa y de Liquidaciones</Text>
                </View>
                <View style={styles.headerRight}>
                    <Text>Generado: {new Date().toLocaleDateString()}</Text>
                    <Text>Generado por: {userName || 'Sistema'}</Text>
                    <Text>Total registros: {payments?.length || 0}</Text>
                </View>
            </View>

            <View style={styles.table}>
                {/* Encabezados */}
                <View style={[styles.tableRow, styles.tableColHeader]}>
                    <Text style={[styles.colId, styles.cell]}>ID</Text>
                    <Text style={[styles.colFecha, styles.cell]}>Fecha</Text>
                    <Text style={[styles.colCliente, styles.cell]}>Cliente</Text>
                    <Text style={[styles.colRecibo, styles.cell]}>N° Recibo</Text>
                    <Text style={[styles.colFactura, styles.cell]}>N° Factura</Text>
                    <Text style={[styles.colFacturaMonto, styles.cell]}>Monto Fact.</Text>
                    <Text style={[styles.colMonto, styles.cell]}>Monto Pagado</Text>
                    <Text style={[styles.colSaldo, styles.cell]}>Saldo Restante</Text>
                    <Text style={[styles.colEstado, styles.cell]}>Estado</Text>
                    <Text style={[styles.colNotas, styles.cell]}>Notas</Text>
                </View>

                {/* Filas */}
                {payments && payments.map((p, index) => (
                    <View style={styles.tableRow} key={index}>
                        <Text style={[styles.colId, styles.cell]}>{p.id}</Text>
                        <Text style={[styles.colFecha, styles.cell]}>{p.date}</Text>
                        <Text style={[styles.colCliente, styles.cell]}>{p.customer_name}</Text>
                        <Text style={[styles.colRecibo, styles.cell]}>{p.receipt_number}</Text>
                        <Text style={[styles.colFactura, styles.cell]}>{p.invoice_number || '-'}</Text>
                        
                        <Text style={[styles.colFacturaMonto, styles.cell]}>
                            $ {Number(p.invoice_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>

                        <Text style={[styles.colMonto, styles.cell]}>
                            $ {Number(p.bill_payment || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>

                        <Text style={[styles.colSaldo, styles.cell]}>
                            $ {Number(p.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Text>

                        <Text style={[
                            styles.colEstado,
                            styles.cell,
                            (p.status === 'active' || p.status === 1 || p.status === true) 
                                ? styles.statusActive 
                                : styles.statusInactive
                        ]}>
                            {(p.status === 'active' || p.status === 1 || p.status === true) 
                                ? 'ACTIVO' 
                                : 'ANULADO'}
                        </Text>

                        <Text style={[styles.colNotas, styles.cell, styles.notasText]}>
                            {p.notes || '—'}
                        </Text>
                    </View>
                ))}
            </View>

            <Text 
                style={styles.footer} 
                render={({ pageNumber, totalPages }) => 
                    `Página ${pageNumber} de ${totalPages} — ${appName || ''} — Generado por: ${userName || ''}`
                } 
                fixed 
            />
        </Page>
    </Document>
);

export default PaymentPDF;