<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('staff_number')->unique();
            $table->string('designation');
            $table->string('designation_ne')->nullable();
            $table->enum('employment_type', ['permanent','temporary','contract','part_time'])->default('permanent');
            $table->date('join_date')->nullable();
            $table->decimal('basic_salary', 10, 2)->default(0);
            $table->string('salary_grade')->nullable();
            $table->enum('status', ['active','inactive','resigned','terminated'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('staff'); }
};
