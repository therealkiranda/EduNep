<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('institutions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ne')->nullable();
            $table->enum('type', ['school','college','both'])->default('school');
            $table->string('logo')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('district')->nullable();
            $table->string('province')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('currency', 10)->default('NPR');
            $table->string('timezone')->default('Asia/Kathmandu');
            $table->string('language', 5)->default('en');
            $table->string('theme_color', 10)->default('#1B6CA8');
            $table->string('slogan')->nullable();
            $table->string('slogan_ne')->nullable();
            $table->string('registration_number')->nullable();
            $table->enum('status', ['active','inactive','suspended'])->default('active');
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('institutions'); }
};
