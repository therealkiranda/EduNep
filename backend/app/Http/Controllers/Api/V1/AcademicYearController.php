<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AcademicYearController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $years = AcademicYear::with('terms')
            ->where('institution_id', $request->user()->institution_id)
            ->latest()->get();
        return response()->json(['data' => $years]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:255',
            'start_date' => 'required|date', 'end_date' => 'required|date|after:start_date']);
        $year = AcademicYear::create([
            ...$request->only('name','start_date','end_date'),
            'institution_id' => $request->user()->institution_id,
            'is_current'     => false,
        ]);
        return response()->json(['data' => $year, 'message' => __('messages.created')], 201);
    }
    public function show(AcademicYear $academicYear): JsonResponse
    {
        return response()->json(['data' => $academicYear->load('terms')]);
    }
    public function update(Request $request, AcademicYear $academicYear): JsonResponse
    {
        $academicYear->update($request->only('name','start_date','end_date'));
        return response()->json(['data' => $academicYear, 'message' => __('messages.updated')]);
    }
    public function destroy(AcademicYear $academicYear): JsonResponse
    {
        $academicYear->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
    public function setCurrent(Request $request, AcademicYear $academicYear): JsonResponse
    {
        AcademicYear::where('institution_id', $request->user()->institution_id)->update(['is_current' => false]);
        $academicYear->update(['is_current' => true]);
        return response()->json(['message' => 'Set as current academic year.', 'data' => $academicYear]);
    }
}
