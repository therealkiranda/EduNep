<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\LibraryBook;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = LibraryBook::where('institution_id', $request->user()->institution_id)
            ->latest()->paginate($request->per_page ?? 20);
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $item = LibraryBook::create([
            ...$request->validated(),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $item, 'message' => __('messages.created')], 201);
    }

    public function show(LibraryBook $item): JsonResponse
    {
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, LibraryBook $item): JsonResponse
    {
        $item->update($request->validated());
        return response()->json(['data' => $item, 'message' => __('messages.updated')]);
    }

    public function destroy(LibraryBook $item): JsonResponse
    {
        $item->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
