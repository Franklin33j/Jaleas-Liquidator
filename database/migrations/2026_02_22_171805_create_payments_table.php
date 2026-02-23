<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->integer('receipt_number');
            $table->date('date');
            $table->foreignId('customers_id')->constrained('customers');
            $table->float('bill_payment');
            $table->float('balance');
            $table->integer('invoice_number');
            $table->boolean('status');
            $table->text('notes')->nullable();
            $table->text('logs')->nullable();
            $table->integer('fiscal_year')->default(DB::raw('(YEAR(CURRENT_DATE))'));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
