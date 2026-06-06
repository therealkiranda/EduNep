<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnDelete();
            $table->decimal('ca_marks', 5, 2)->default(0);
            $table->decimal('exam_marks', 5, 2)->default(0);
            $table->decimal('total', 5, 2)->default(0);
            $table->string('grade', 5)->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
            $table->integer('position')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->unique(['student_id','subject_id','term_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('grades'); }
};
