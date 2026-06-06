<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('due_date');
            $table->integer('max_marks')->default(100);
            $table->boolean('allow_late')->default(false);
            $table->string('attachment')->nullable();
            $table->enum('status', ['draft','published','closed'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->text('text_answer')->nullable();
            $table->string('file_url')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->boolean('is_late')->default(false);
            $table->decimal('marks', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('graded_at')->nullable();
            $table->enum('status', ['pending','submitted','graded'])->default('pending');
            $table->timestamps();
            $table->unique(['assignment_id','student_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignments');
    }
};
