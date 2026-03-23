<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class LiquidationController extends Controller
{
    public function liquidationView()
    {
        return Inertia::render('Liquidations/LiquidationIndex');
    }
}
