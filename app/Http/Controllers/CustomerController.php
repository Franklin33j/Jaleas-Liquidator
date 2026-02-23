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
}
