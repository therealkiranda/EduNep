<?php
// ============================================================
// EDUNEP — ALL MIGRATIONS (run in order)
// File: database/migrations/schema.php (reference only)
// Split into individual dated migration files for Laravel
// ============================================================

// 001_create_institutions_table
Schema::create('institutions', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('name_ne')->nullable();
    $table->enum('type', ['school', 'college', 'both'])->default('school');
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
    $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
    $table->json('settings')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// 002_create_users_table
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->string('password');
    $table->string('avatar')->nullable();
    $table->string('language', 5)->default('en');
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->boolean('two_factor_enabled')->default(false);
    $table->string('two_factor_secret')->nullable();
    $table->timestamp('last_login_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
    $table->softDeletes();
});

// 003_create_academic_years_table
Schema::create('academic_years', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "2081-2082 BS"
    $table->date('start_date');
    $table->date('end_date');
    $table->boolean('is_current')->default(false);
    $table->timestamps();
});

// 004_create_terms_table
Schema::create('terms', function (Blueprint $table) {
    $table->id();
    $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "First Term", "First Semester"
    $table->date('start_date');
    $table->date('end_date');
    $table->boolean('is_current')->default(false);
    $table->timestamps();
});

// 005_create_departments_table
Schema::create('departments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('name_ne')->nullable();
    $table->string('code')->nullable();
    $table->foreignId('hod_id')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();
    $table->softDeletes();
});

// 006_create_classes_table
Schema::create('classes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name'); // e.g. "Class 10", "BBA Semester 1"
    $table->string('name_ne')->nullable();
    $table->string('level')->nullable(); // primary, secondary, college
    $table->string('stream')->nullable(); // Science, Management, Arts
    $table->integer('capacity')->default(40);
    $table->timestamps();
    $table->softDeletes();
});

// 007_create_sections_table
Schema::create('sections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
    $table->string('name'); // A, B, C
    $table->integer('capacity')->default(40);
    $table->timestamps();
});

// 008_create_students_table
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('admission_number')->unique();
    $table->foreignId('class_id')->constrained('classes');
    $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
    $table->enum('gender', ['male', 'female', 'other']);
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

// 009_create_staff_table
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

// 010_create_subjects_table
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

// 011_create_class_subjects_table
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

// 012_create_timetables_table
Schema::create('timetables', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
    $table->foreignId('class_subject_id')->constrained()->cascadeOnDelete();
    $table->tinyInteger('day_of_week'); // 0=Sun, 1=Mon ... 6=Sat
    $table->time('start_time');
    $table->time('end_time');
    $table->string('room')->nullable();
    $table->timestamps();
});

// 013_create_attendance_table
Schema::create('attendance', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->foreignId('class_id')->constrained('classes');
    $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
    $table->date('date');
    $table->enum('status', ['present','absent','late','excused'])->default('present');
    $table->string('note')->nullable();
    $table->timestamps();
    $table->unique(['student_id','date','subject_id']);
});

// 014_create_assignments_table
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

// 015_create_submissions_table
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

// 016_create_exams_table
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

// 017_create_exam_questions_table
Schema::create('exam_questions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
    $table->text('question');
    $table->enum('type', ['mcq','essay','short_answer','true_false','file_upload'])->default('mcq');
    $table->json('options')->nullable(); // for MCQ
    $table->text('correct_answer')->nullable();
    $table->integer('marks')->default(1);
    $table->integer('order')->default(0);
    $table->timestamps();
});

// 018_create_exam_results_table
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

// 019_create_grades_table
Schema::create('grades', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
    $table->foreignId('term_id')->constrained()->cascadeOnDelete();
    $table->decimal('ca_marks', 5, 2)->default(0);   // Continuous Assessment
    $table->decimal('exam_marks', 5, 2)->default(0);
    $table->decimal('total', 5, 2)->default(0);
    $table->string('grade', 5)->nullable();           // A+, A, B+...
    $table->decimal('gpa', 3, 2)->nullable();
    $table->integer('position')->nullable();
    $table->text('remarks')->nullable();
    $table->timestamps();
    $table->unique(['student_id','subject_id','term_id']);
});

// 020_create_fee_structures_table
Schema::create('fee_structures', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
    $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');
    $table->string('name_ne')->nullable();
    $table->decimal('amount', 10, 2);
    $table->boolean('is_mandatory')->default(true);
    $table->enum('frequency', ['once','monthly','termly','yearly'])->default('termly');
    $table->timestamps();
    $table->softDeletes();
});

// 021_create_invoices_table
Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();
    $table->string('invoice_number')->unique();
    $table->decimal('total_amount', 10, 2);
    $table->decimal('discount', 10, 2)->default(0);
    $table->decimal('net_amount', 10, 2);
    $table->date('due_date');
    $table->enum('status', ['unpaid','partial','paid','cancelled'])->default('unpaid');
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// 022_create_invoice_items_table
Schema::create('invoice_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
    $table->foreignId('fee_structure_id')->nullable()->constrained()->nullOnDelete();
    $table->string('description');
    $table->decimal('amount', 10, 2);
    $table->timestamps();
});

// 023_create_payments_table
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->decimal('amount', 10, 2);
    $table->enum('method', ['cash','bank_transfer','esewa','khalti','qr','cheque'])->default('cash');
    $table->string('reference')->unique();
    $table->string('gateway_ref')->nullable();
    $table->string('bank_name')->nullable();
    $table->text('note')->nullable();
    $table->enum('status', ['pending','completed','failed','refunded'])->default('pending');
    $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
});

// 024_create_scholarships_table
Schema::create('scholarships', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->enum('type', ['full','partial','percentage','amount'])->default('percentage');
    $table->decimal('value', 8, 2); // % or NPR amount
    $table->text('criteria')->nullable();
    $table->timestamps();
});

// 025_create_student_scholarships_table
Schema::create('student_scholarships', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->foreignId('scholarship_id')->constrained()->cascadeOnDelete();
    $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
    $table->enum('status', ['active','expired'])->default('active');
    $table->timestamps();
    $table->unique(['student_id','scholarship_id','academic_year_id']);
});

// 026_create_payroll_table
Schema::create('payroll', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('staff_id')->constrained()->cascadeOnDelete();
    $table->string('month'); // "2025-05"
    $table->decimal('basic', 10, 2)->default(0);
    $table->json('allowances')->nullable();  // {"house":5000,"transport":2000}
    $table->json('deductions')->nullable();  // {"pf":500,"tax":1200}
    $table->decimal('gross', 10, 2)->default(0);
    $table->decimal('net', 10, 2)->default(0);
    $table->enum('status', ['draft','approved','paid'])->default('draft');
    $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->unique(['staff_id','month']);
});

// 027_create_leaves_table
Schema::create('leaves', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('type', ['sick','casual','annual','maternity','paternity','unpaid'])->default('casual');
    $table->date('start_date');
    $table->date('end_date');
    $table->integer('days');
    $table->text('reason');
    $table->string('attachment')->nullable();
    $table->enum('status', ['pending','approved','rejected'])->default('pending');
    $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
    $table->text('review_note')->nullable();
    $table->timestamp('reviewed_at')->nullable();
    $table->timestamps();
});

// 028_create_library_books_table
Schema::create('library_books', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('author')->nullable();
    $table->string('isbn')->nullable();
    $table->string('category')->nullable();
    $table->string('publisher')->nullable();
    $table->year('published_year')->nullable();
    $table->integer('total_copies')->default(1);
    $table->integer('available_copies')->default(1);
    $table->string('location')->nullable(); // shelf/rack
    $table->string('cover_image')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// 029_create_book_borrows_table
Schema::create('book_borrows', function (Blueprint $table) {
    $table->id();
    $table->foreignId('book_id')->constrained('library_books')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // student or staff
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->date('borrowed_date');
    $table->date('due_date');
    $table->date('returned_date')->nullable();
    $table->decimal('fine', 8, 2)->default(0);
    $table->enum('status', ['borrowed','returned','overdue'])->default('borrowed');
    $table->timestamps();
});

// 030_create_announcements_table
Schema::create('announcements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
    $table->string('title');
    $table->string('title_ne')->nullable();
    $table->longText('body');
    $table->longText('body_ne')->nullable();
    $table->enum('audience', ['all','staff','students','parents','teachers'])->default('all');
    $table->enum('status', ['draft','published'])->default('draft');
    $table->timestamp('published_at')->nullable();
    $table->string('attachment')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// 031_create_messages_table
Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
    $table->string('subject')->nullable();
    $table->text('body');
    $table->boolean('is_read')->default(false);
    $table->timestamp('read_at')->nullable();
    $table->string('attachment')->nullable();
    $table->timestamps();
    $table->softDeletes();
});

// 032_create_notifications_table
Schema::create('notifications', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('type');
    $table->morphs('notifiable');
    $table->text('data');
    $table->timestamp('read_at')->nullable();
    $table->timestamps();
});

// 033_create_calendar_events_table
Schema::create('calendar_events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
    $table->string('title');
    $table->string('title_ne')->nullable();
    $table->text('description')->nullable();
    $table->date('start_date');
    $table->date('end_date')->nullable();
    $table->enum('type', ['holiday','exam','event','meeting','other'])->default('event');
    $table->string('color', 10)->nullable();
    $table->boolean('all_day')->default(true);
    $table->timestamps();
    $table->softDeletes();
});

// 034_create_settings_table
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->foreignId('institution_id')->constrained()->cascadeOnDelete();
    $table->string('key');
    $table->text('value')->nullable();
    $table->timestamps();
    $table->unique(['institution_id','key']);
});
