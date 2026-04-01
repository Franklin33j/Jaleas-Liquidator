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
     */
    public function rules(): array
    {
        return [
            'customer_id' => [
                'required',
                'exists:customers,id'
            ],
            // Nuevo campo: Monto Total de la Factura
            'invoice_amount' => [
                'required',
                'numeric',
                'min:0'
            ],
            'receipt_number' => [
                'required',
                'numeric',
                'min:0',
            ],
            'invoice_number' => [
                'required',
                'numeric',
                'min:0',
            ],
            'date' => [
                'required',
                'date',
                'before_or_equal:today'
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
     * Mensajes personalizados
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Debe seleccionar un cliente para registrar el pago.',
            'customer_id.exists'   => 'El cliente seleccionado no es válido.',

            // Validación para el nuevo campo
            'invoice_amount.required' => 'El monto total de la factura es obligatorio.',
            'invoice_amount.numeric'  => 'El monto total debe ser un valor numérico.',
            'invoice_amount.min'      => 'El monto total no puede ser negativo.',

            // Número de Recibo
            'receipt_number.required' => 'El número de recibo es obligatorio.',
            'receipt_number.numeric'  => 'El número de recibo debe contener solo números.',
            'receipt_number.min'      => 'El número de recibo debe ser un valor positivo.',

            // Número de Factura
            'invoice_number.required' => 'El número de factura es obligatorio.',
            'invoice_number.numeric'  => 'El número de factura debe contener solo números.',
            'invoice_number.min'      => 'El número de factura debe ser un valor positivo.',

            'date.required'           => 'La fecha del pago es obligatoria.',
            'date.before_or_equal'    => 'La fecha del pago no puede ser mayor a la de hoy.',

            'bill_payment.required'   => 'El monto del pago es obligatorio.',
            'bill_payment.numeric'    => 'El monto debe ser un valor numérico.',
            'bill_payment.min'        => 'El monto pagado no puede ser negativo.',

            'balance.required'        => 'El saldo restante es obligatorio.',
            'balance.numeric'         => 'El saldo debe ser un valor numérico.',
            'balance.min'             => 'El saldo no puede ser negativo.',

            'status.boolean'          => 'El estado debe ser activo o inactivo.',
            'notes.max'               => 'Las notas no pueden exceder los 1000 caracteres.',
        ];
    }
}