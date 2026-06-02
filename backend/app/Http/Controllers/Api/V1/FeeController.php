<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = FeeStructure::where('institution_id', $request->user()->institution_id)
            ->latest()->paginate($request->per_page ?? 20);
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $item = FeeStructure::create([
            ...$request->validated(),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $item, 'message' => __('messages.created')], 201);
    }

    public function show(FeeStructure $item): JsonResponse
    {
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, FeeStructure $item): JsonResponse
    {
        $item->update($request->validated());
        return response()->json(['data' => $item, 'message' => __('messages.updated')]);
    }

    public function destroy(FeeStructure $item): JsonResponse
    {
        $item->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
