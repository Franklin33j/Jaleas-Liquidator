<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {/*
        User::create([
            'name' => 'Franklin guevara',
            'email' => 'angelguevaraj@gmail.com',
            'password' => Hash::make('12345678'), 
            'email_verified_at' => now(),
        ]);
         User::create([
            'name' => 'Deisy Saravia ',
            'email' => 'nsaravia.jaleasdelpino@outlook.com',
            'password' => Hash::make('12345678'), 
            'email_verified_at' => now(),
        ]);
         User::create([
            'name' => 'Rachel Quezada',
            'email' => 'rachel.quezada.chavez@outlook.com',
            'password' => Hash::make('12345678'), 
            'email_verified_at' => now(),
        ]);*/
         User::create([
            'name' => 'Yesenia Dubon',
            'email' => 'jaz.dubon@outlook.com',
            'password' => Hash::make('12345678'), 
            'email_verified_at' => now(),
        ]);
    }
}
