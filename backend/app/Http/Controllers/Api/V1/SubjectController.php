<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Subject::where('institution_id', $request->user()->institution_id)
            ->latest()->paginate($request->per_page ?? 20);
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $item = Subject::create([
            ...$request->validated(),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $item, 'message' => __('messages.created')], 201);
    }

    public function show(Subject $item): JsonResponse
    {
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, Subject $item): JsonResponse
    {
        $item->update($request->validated());
        return response()->json(['data' => $item, 'message' => __('messages.updated')]);
    }

    public function destroy(Subject $item): JsonResponse
    {
        $item->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
