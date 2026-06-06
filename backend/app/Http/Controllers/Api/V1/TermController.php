<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TermController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $terms = Term::where('institution_id', $request->user()->institution_id)
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->latest()->get();
        return response()->json(['data' => $terms]);
    }
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'academic_year_id' => 'required|exists:academic_years,id',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
        ]);
        $term = Term::create([
            ...$request->only('name','academic_year_id','start_date','end_date'),
            'institution_id' => $request->user()->institution_id,
            'is_current'     => false,
        ]);
        return response()->json(['data' => $term, 'message' => __('messages.created')], 201);
    }
    public function show(Term $term): JsonResponse
    {
        return response()->json(['data' => $term]);
    }
    public function update(Request $request, Term $term): JsonResponse
    {
        $term->update($request->only('name','start_date','end_date'));
        return response()->json(['data' => $term, 'message' => __('messages.updated')]);
    }
    public function destroy(Term $term): JsonResponse
    {
        $term->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
    public function setCurrent(Request $request, Term $term): JsonResponse
    {
        Term::where('institution_id', $request->user()->institution_id)->update(['is_current' => false]);
        $term->update(['is_current' => true]);
        return response()->json(['message' => 'Set as current term.', 'data' => $term]);
    }
}
