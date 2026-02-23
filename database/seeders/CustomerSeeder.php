<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'name' => 'Distribuidora Los Ángeles S.A.',
                'reference' => 'REF-2024-001',
            ],
            [
                'name' => 'Tienda de Conveniencia "El Paso"',
                'reference' => 'REF-2024-002',
            ],
            [
                'name' => 'Supermercado La Canasta',
                'reference' => 'REF-2024-003',
            ],
            [
                'name' => 'Abarrotería Central',
                'reference' => 'REF-2024-004',
            ],
            [
                'name' => 'Jaleas y Dulces Artesanales S.A.',
                'reference' => 'REF-2024-005',
            ],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
