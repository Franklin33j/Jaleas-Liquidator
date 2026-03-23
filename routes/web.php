<?php

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});
Route::get('/payments', [PaymentController::class, 'paymentView'])->name('payments')->middleware('auth');
Route::get('/operations', function () {
    return Inertia::render('Operations/OperationIndex');
})->name('operations')->middleware('auth');

Route::get('/reports', function () {
    return Inertia::render('Reports/ReportIndex');
})->name('reports')->middleware('auth');
Route::get('/liquidations', function () {
    return Inertia::render('Liquidations/LiquidationIndex');
})->name('liquidations')->middleware('auth');

Route::get('/customersr', function () {
    return Inertia::render('Customers/CustomerIndex');
})->name('customersr')->middleware('auth');
require __DIR__ . '/auth.php';
