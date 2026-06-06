<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('name_ne')->nullable();
            $table->string('code')->nullable();
            $table->integer('credit_hours')->default(0);
            $table->enum('type', ['theory','practical','both'])->default('theory');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('periods_per_week')->default(5);
            $table->timestamps();
            $table->unique(['class_id','subject_id','term_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('class_subjects');
        Schema::dropIfExists('subjects');
    }
};
