<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Obtenemos el ID del pago si estamos en una ruta de actualización (puedes ajustarlo según tu ruta)
        $paymentId = $this->route('payment') ? $this->route('payment')->id : $this->id;

        return [
            'customer_id' => [
                'required',
                'exists:customers,id' // Valida que el cliente realmente exista en la DB
            ],
            'receipt_number' => [
                'required',
                'string',
                'max:50',
                // Único en la tabla payments, pero ignora el ID actual si es una actualización
                'unique:payments,receipt_number,' . $paymentId
            ],
            'invoice_number' => [
                'required',
                'string',
                'max:50'
            ],
            'date' => [
                'required',
                'date',
                'before_or_equal:today' // Lógica contable: no permitir pagos futuros si no aplica
            ],
            'bill_payment' => [
                'required',
                'numeric',
                'min:0'
            ],
            'balance' => [
                'required',
                'numeric',
                'min:0'
            ],
            'status' => [
                'boolean'
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000'
            ],
        ];
    }

    /**
     * Mensajes personalizados para que el frontend (React) los muestre en español
     */
    public function messages(): array
    {
        return [
            // ID del Cliente
            'customer_id.required' => 'Debe seleccionar un cliente para registrar el pago.',
            'customer_id.exists'   => 'El cliente seleccionado no es válido o no existe en el sistema.',

            // Número de Recibo
            'receipt_number.required' => 'El número de recibo es obligatorio.',
            'receipt_number.string'   => 'El número de recibo debe ser una cadena de texto.',
            'receipt_number.max'      => 'El número de recibo no puede exceder los 50 caracteres.',
            'receipt_number.unique'   => 'Este número de recibo ya ha sido registrado anteriormente.',

            // Número de Factura
            'invoice_number.required' => 'El número de factura es obligatorio.',
            'invoice_number.string'   => 'El número de factura debe ser una cadena de texto.',
            'invoice_number.max'      => 'El número de factura no puede exceder los 50 caracteres.',

            // Fecha
            'date.required'           => 'La fecha del pago es obligatoria.',
            'date.date'               => 'La fecha ingresada no tiene un formato válido.',
            'date.before_or_equal'    => 'La fecha del pago no puede ser mayor a la fecha de hoy.',

            // Monto del Pago (bill_payment)
            'bill_payment.required'   => 'El monto del pago es obligatorio.',
            'bill_payment.numeric'    => 'El monto debe ser un valor numérico.',
            'bill_payment.min'        => 'El monto del pago no puede ser un valor negativo.',

            // Saldo (balance)
            'balance.required'        => 'El saldo restante es obligatorio.',
            'balance.numeric'         => 'El saldo debe ser un valor numérico.',
            'balance.min'             => 'El saldo no puede ser un valor negativo.',

            // Estado y Notas
            'status.boolean'          => 'El estado debe ser activo o inactivo.',
            'notes.string'            => 'Las notas deben ser un texto válido.',
            'notes.max'               => 'Las notas no pueden exceder los 1000 caracteres.',
        ];
    }
}
