<?php

namespace App\Http\Controllers;

use App\Models\Movement;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MovementController extends Controller
{
    public function movementView()
    {
        return Inertia::render('Movements/MovementIndex');
    }
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            Movement::create([
                'date' => $request->input('date'),
                'seller_id' => $request->input('seller_id'),
                'customer_id' => Auth::id(),
                'data' => json_encode($request->input('data')),
            ]);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el movimiento',
                'error' => $e->getMessage(),
            ], 500);
        }
        return response()->json([
            'message' => 'Movimiento registrado exitosamente',
        ]);
    }
}
