<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SellerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sellers = [
            ['name' => 'Jorge Rivera', 'seller_code' => 'SELLER001'],
            ['name' => 'Marvin Perez', 'seller_code' => 'SELLER002'],
            ['name' => 'Luis Chavez', 'seller_code' => 'SELLER003'],
            ['name' => 'Edgar Cornejo', 'seller_code' => 'SELLER004'],
            ['name' => 'Yamileth Quintanilla', 'seller_code' => 'SELLER005'],
        ];

        foreach ($sellers as $seller) {
            \App\Models\Seller::create($seller);
        }
    }
}
