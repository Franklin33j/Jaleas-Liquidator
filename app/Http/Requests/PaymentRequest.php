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
    // Obtenemos el ID para lógica de actualización si fuera necesario
    $paymentId = $this->route('payment') ? $this->route('payment')->id : $this->id;

    return [
        'customer_id' => [
            'required',
            'exists:customers,id'
        ],
        'receipt_number' => [
            'required',
            'numeric', // Cambiado de string a numeric
            'min:0',   // Opcional: asegura que sea un número positivo
        ],
        'invoice_number' => [
            'required',
            'numeric', // Cambiado de string a numeric
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
 * Mensajes personalizados actualizados
 */
public function messages(): array
{
    return [
        'customer_id.required' => 'Debe seleccionar un cliente para registrar el pago.',
        'customer_id.exists'   => 'El cliente seleccionado no es válido.',

        // Número de Recibo (Numérico)
        'receipt_number.required' => 'El número de recibo es obligatorio.',
        'receipt_number.numeric'  => 'El número de recibo debe contener solo números.',
        'receipt_number.min'      => 'El número de recibo debe ser un valor positivo.',

        // Número de Factura (Numérico)
        'invoice_number.required' => 'El número de factura es obligatorio.',
        'invoice_number.numeric'  => 'El número de factura debe contener solo números.',
        'invoice_number.min'      => 'El número de factura debe ser un valor positivo.',

        'date.required'           => 'La fecha del pago es obligatoria.',
        'date.before_or_equal'    => 'La fecha del pago no puede ser mayor a la de hoy.',

        'bill_payment.required'   => 'El monto del pago es obligatorio.',
        'bill_payment.numeric'    => 'El monto debe ser un valor numérico.',

        'balance.required'        => 'El saldo restante es obligatorio.',
        'balance.numeric'         => 'El saldo debe ser un valor numérico.',

        'status.boolean'          => 'El estado debe ser activo o inactivo.',
        'notes.max'               => 'Las notas no pueden exceder los 1000 caracteres.',
    ];
}
}
