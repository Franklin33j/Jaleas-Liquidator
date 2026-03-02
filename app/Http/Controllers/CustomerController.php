<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            $customers = Customer::all();
            return response()->json([
                "message" => null,
                "data" => $customers,
                "error" => null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => null,
                "data" => null,
                "error" => "La solicitud no se proceso con éxito, contacte su administrador",
            ]);
        }
    }
    public function findByMatch(Request $request)
    {

        try {
            $request->validate([
                'search' => 'required|string|min:2'
            ]);

            $searchTerm = $request->search;

            $customers = Customer::where('name', 'LIKE', "%{$searchTerm}%")
                ->limit(15)
                ->get();

            return response()->json([
                'data' => $customers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Error interno",
                "data" => null,
                "error" => "La solicitud no se procesó con éxito, contacte su administrador",
            ], 500);
        }
    }
}
