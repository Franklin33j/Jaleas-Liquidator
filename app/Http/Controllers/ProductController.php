<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Según tu dd(), el dato viene dentro de 'params' y luego 'searchTerm'
        $searchTerm = $request->input('params.searchTerm');

        $query = Product::query();

        if ($searchTerm) {
            $query->where('name', 'LIKE', '%' . $searchTerm . '%');
        }

        return response()->json($query->get());
    }
}
