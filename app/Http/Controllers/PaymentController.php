<?php

namespace App\Http\Controllers;

use App\Exports\PaymentExport;
use App\Http\Requests\PaymentRequest;
use App\Models\Payment;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PaymentController extends Controller
{
    public function paymentView()
    {
        return Inertia::render('Payments/PaymentIndex');
    }
    public function index(Request $request)
    {
        try {
            $query = Payment::query()
                ->join('customers', 'payments.customer_id', '=', 'customers.id')
                ->select([
                    'payments.*',
                    'customers.name as customer_name',
                    'customers.id as customer_id'
                ])
                ->when(
                    $request->filled('search'),
                    fn($q) => $q->where('payments.receipt_number', 'LIKE', "%{$request->search}%")
                )
                ->when(
                    $request->filled('customer_id'),
                    fn($q) => $q->where('payments.customers_id', $request->customer_id)
                )
                ->when($request->filled(['from_date', 'to_date']), function ($q) use ($request) {
                    $from = Carbon::parse($request->from_date)->startOfDay();
                    $to = Carbon::parse($request->to_date)->endOfDay();
                    $q->whereBetween('payments.date', [$from, $to]);
                })
                ->when(
                    $request->filled('status') && $request->status !== 'all',
                    fn($q) => $q->where('payments.status', $request->status === 'active' ? 1 : 0)
                )
                ->orderBy('payments.date', $request->input('order', 'desc'))
                ->paginate($request->input('per_page', 10));

            return response()->json([
                'data' => $query,
            ]);
        } catch (Exception $e) {
            Log::error("Error al leer los pagos: " . $e->getMessage());

            return response()->json([

                'error' => "No se ha podido procesar la operación, contacte a su administrador",
            ], 500);
        }
    }
    public function store(PaymentRequest $request)
    {
        try {
            DB::beginTransaction();

            Payment::create($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Pago registrado con éxito',
                'data' => null,
                'error' => null
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();

            Log::error("Error al guardar pago: " . $e->getMessage());

            return response()->json([

                'error' => "No se ha podido procesar la operación, contacte a su administrador",
            ], 500);
        }
    }
    public function delete($id)
    {
        try {
            DB::beginTransaction();
            $payment = Payment::findOrFail($id);
            if ($payment->status === 0) {
                return response()->json([
                    "message" => "Este pago ya ha sido invalidado previamente",
                ], 200);
            }
            $payment->delete();
            DB::commit();
            return response()->json([
                "message" => "Se ha eliminado la transaccion.",
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => "No se ha podido procesar la operación, contacte a su administrador",
            ], 500);
        }
    }
    public function exportExcel(Request $request)
    {
        return Excel::download(new PaymentExport($request), 'reporte-pagos.xlsx');
    }
    public function exportPDF(Request $request)
    {
        try {
            $query = Payment::query()
                ->join('customers', 'payments.customer_id', '=', 'customers.id')
                ->select([
                    'payments.*',
                    'customers.name as customer_name',
                    'customers.id as customer_id'
                ]);

            // --- Filtros Lógicos ---

            // Búsqueda por número de recibo
            if ($request->filled('search')) {
                $query->where('payments.receipt_number', 'LIKE', "%{$request->search}%");
            }

            // Filtro por Cliente específico
            if ($request->filled('customer_id')) {
                $query->where('payments.customer_id', $request->customer_id);
            }

            // Rango de fechas (Contabilidad)
            if ($request->filled(['from_date', 'to_date'])) {
                $from = Carbon::parse($request->from_date)->startOfDay();
                $to = Carbon::parse($request->to_date)->endOfDay();
                $query->whereBetween('payments.date', [$from, $to]);
            }

            // Estado (Activo/Inactivo)
            if ($request->filled('status') && $request->status !== 'all') {
                $status = $request->status === 'active' ? 1 : 0;
                $query->where('payments.status', $status);
            }

            $query->orderBy('payments.date', $request->input('order', 'desc'));

            return response()->json([
                'data' => $query->get()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener los datos',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
