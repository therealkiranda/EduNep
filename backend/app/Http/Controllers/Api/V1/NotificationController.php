<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Notification::where('institution_id', $request->user()->institution_id)
            ->latest()->paginate($request->per_page ?? 20);
        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $item = Notification::create([
            ...$request->validated(),
            'institution_id' => $request->user()->institution_id,
        ]);
        return response()->json(['data' => $item, 'message' => __('messages.created')], 201);
    }

    public function show(Notification $item): JsonResponse
    {
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, Notification $item): JsonResponse
    {
        $item->update($request->validated());
        return response()->json(['data' => $item, 'message' => __('messages.updated')]);
    }

    public function destroy(Notification $item): JsonResponse
    {
        $item->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }
}
