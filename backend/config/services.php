<?php
return [
    'esewa' => [
        'merchant_code' => env('ESEWA_MERCHANT_CODE'),
        'secret_key'    => env('ESEWA_SECRET_KEY'),
        'env'           => env('ESEWA_ENV', 'sandbox'),
    ],
    'khalti' => [
        'secret_key' => env('KHALTI_SECRET_KEY'),
        'env'        => env('KHALTI_ENV', 'sandbox'),
    ],
    'pusher' => [
        'app_id'  => env('PUSHER_APP_ID'),
        'key'     => env('PUSHER_APP_KEY'),
        'secret'  => env('PUSHER_APP_SECRET'),
        'cluster' => env('PUSHER_APP_CLUSTER', 'ap2'),
    ],
    'cloudinary' => ['url' => env('CLOUDINARY_URL')],
    'mailgun'    => ['domain' => env('MAILGUN_DOMAIN'), 'secret' => env('MAILGUN_SECRET'), 'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net')],
    'africastalking' => ['username' => env('AT_USERNAME'), 'api_key' => env('AT_API_KEY'), 'sender_id' => env('AT_SENDER_ID', 'EduNep')],
];
