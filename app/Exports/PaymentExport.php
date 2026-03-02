<?php

namespace App\Exports;

use App\Models\Payment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class PaymentExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $request;

    // Pasamos el request al constructor para aplicar los mismos filtros que en la tabla
    public function __construct($request)
    {
        $this->request = $request;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
   
        return Payment::query()
            ->join('customers', 'payments.customer_id', '=', 'customers.id')
            ->select([
                'payments.*',
                'customers.name as customer_name',
            ])
            ->when($this->request->search, function ($q) {
                $q->where('payments.receipt_number', 'LIKE', "%{$this->request->search}%");
            })
            ->when($this->request->customer_id, function ($q) {
                $q->where('payments.customer_id', $this->request->customer_id);
            })
            ->when($this->request->filled(['from_date', 'to_date']), function ($q) {
                $from = Carbon::parse($this->request->from_date)->startOfDay();
                $to = Carbon::parse($this->request->to_date)->endOfDay();
                $q->whereBetween('payments.date', [$from, $to]);
            })
            ->when($this->request->status && $this->request->status !== 'all', function ($q) {
                $q->where('payments.status', $this->request->status === 'active' ? 1 : 0);
            })
            ->orderBy('payments.date', $this->request->input('order', 'desc'))
            ->get(); // IMPORTANTE: Usamos get(), no paginate() para el Excel
    }

    /**
     * Definimos los encabezados del Excel
     */
    public function headings(): array
    {
        return [
            'ID Pago',
            'Fecha',
            'Cliente',
            'N° Recibo',
            'N° Factura',
            'Monto Pagado',
            'Saldo Restante',
            'Estado',
            'Notas'
        ];
    }

    /**
     * Mapeamos los datos para que el Excel sea legible
     * @var Payment $payment
     */
    public function map($payment): array
    {
        return [
            $payment->id,
            Carbon::parse($payment->date)->format('d/m/Y'),
            $payment->customer_name,
            $payment->receipt_number,
            $payment->invoice_number,
            number_format($payment->bill_payment, 2),
            number_format($payment->balance, 2),
            $payment->status ? 'Activo' : 'Anulado',
            $payment->notes,
        ];
    }
}