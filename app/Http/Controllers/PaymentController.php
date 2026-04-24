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
                    $request->filled('invoice_number'),
                    fn($q) => $q->where('payments.invoice_number', 'LIKE', "%{$request->invoice_number}%")
                )
                ->when(
                    $request->filled('customer_id'),
                    fn($q) => $q->where('payments.customer_id', $request->customer_id)
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
                'error' => "No se ha podido procesar la operación, contacte a su administrador" . $e->getMessage(),
            ], 500);
        }
    }


    public function show($id)
    {
        try {

            $payment = Payment::with('customer')->find($id);
            if (!$payment) {
                return response()->json([
                    'success' => null,
                    'message' => null,
                    'error' => "El registro no fue encontrado"
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $payment
            ], 200);

        } catch (\Exception $e) {

            Log::error("Error crítico al leer el pago ID {$id}: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Ocurrió un error inesperado en el servidor.',
            ], 500);
        }
    }

    public function update(PaymentRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            // 1. Buscar el registro o lanzar error 404 si no existe
            $payment = Payment::findOrFail($id);

            // 2. Actualizar con los datos validados del Request
            $payment->update($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Pago actualizado con éxito',
                'data' => $payment,
                'error' => null
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'error' => "El registro de pago no existe.",
            ], 404);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error al actualizar pago ID {$id}: " . $e->getMessage());

            return response()->json([
                'error' => "No se ha podido procesar la actualización, contacte a su administrador",
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
        } catch (Exception $e) {
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
        $params = $request->params ?? [];
        try {
            $query = Payment::query()
                ->join('customers', 'payments.customer_id', '=', 'customers.id')
                ->select([
                    'payments.*',
                    'customers.name as customer_name',
                    'customers.id as customer_id'
                ])
                ->when(
                    !empty($params['invoice_number']),
                    fn($q) => $q->where('payments.invoice_number', 'LIKE', "%{$params['invoice_number']}%")
                )
                ->when(
                    !empty($params['search']),
                    fn($q) => $q->where('payments.receipt_number', 'LIKE', "%{$params['search']}%")
                )
                ->when(
                    !empty($params['customer_id']),
                    fn($q) => $q->where('payments.customer_id', $params['customer_id'])
                )
                ->when(!empty($params['from_date']) && !empty($params['to_date']), function ($q) use ($params) {
                    $from = Carbon::parse($params['from_date'])->startOfDay();
                    $to = Carbon::parse($params['to_date'])->endOfDay();
                    $q->whereBetween('payments.date', [$from, $to]);
                })
                ->when(
                    !empty($params['status']) && $params['status'] !== 'all',
                    fn($q) => $q->where('payments.status', $params['status'] === 'active' ? 1 : 0)
                )
                ->orderBy('payments.date', $params['order'] ?? 'desc')
                ->get(); // 👈 aquí el cambio


            return response()->json([
                'data' => $query,
            ]);
        } catch (Exception $e) {
            Log::error("Error al leer los pagos: " . $e->getMessage());

            return response()->json([
                'error' => "No se ha podido procesar la operación, contacte a su administrador" . $e->getMessage(),
            ], 500);
        }
    }
}
