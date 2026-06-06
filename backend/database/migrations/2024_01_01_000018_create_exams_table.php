<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('exam_date');
            $table->integer('duration_mins')->default(180);
            $table->integer('total_marks')->default(100);
            $table->integer('pass_marks')->default(40);
            $table->enum('type', ['written','mcq','practical','oral','mixed'])->default('written');
            $table->enum('status', ['draft','published','ongoing','completed'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->enum('type', ['mcq','essay','short_answer','true_false','file_upload'])->default('mcq');
            $table->json('options')->nullable();
            $table->text('correct_answer')->nullable();
            $table->integer('marks')->default(1);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->decimal('marks_obtained', 5, 2)->default(0);
            $table->string('grade', 5)->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['pass','fail','absent'])->default('pass');
            $table->foreignId('graded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['exam_id','student_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('exam_results');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
    }
};
