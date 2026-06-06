<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
            $table->string('admission_number')->unique();
            $table->foreignId('class_id')->constrained('classes');
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->enum('gender', ['male','female','other']);
            $table->date('dob')->nullable();
            $table->string('blood_group', 5)->nullable();
            $table->string('nationality')->default('Nepali');
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->enum('status', ['active','inactive','graduated','transferred'])->default('active');
            $table->string('transfer_reason')->nullable();
            $table->timestamp('transferred_at')->nullable();
            $table->date('join_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
    public function down(): void { Schema::dropIfExists('students'); }
};
