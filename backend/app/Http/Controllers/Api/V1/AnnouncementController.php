<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $announcements = Announcement::with('creator')
            ->where('institution_id', $request->user()->institution_id)
            ->when($request->status,   fn($q) => $q->where('status', $request->status))
            ->when($request->audience, fn($q) => $q->where('audience', $request->audience))
            ->latest()->paginate(20);
        return response()->json($announcements);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['title' => 'required|string|max:255', 'body' => 'required|string',
            'audience' => 'required|in:all,staff,students,parents,teachers']);
        $ann = Announcement::create([...$request->only('title','title_ne','body','body_ne','audience','attachment'),
            'institution_id' => $request->user()->institution_id,
            'created_by' => $request->user()->id, 'status' => 'draft']);
        return response()->json(['announcement' => $ann, 'message' => __('messages.created')], 201);
    }

    public function show(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkTenant($announcement, $request->user());
        return response()->json(['announcement' => $announcement->load('creator')]);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkTenant($announcement, $request->user());
        $announcement->update($request->only('title','title_ne','body','body_ne','audience'));
        return response()->json(['announcement' => $announcement, 'message' => __('messages.updated')]);
    }

    public function destroy(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkTenant($announcement, $request->user());
        $announcement->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }

    public function publish(Request $request, Announcement $announcement): JsonResponse
    {
        $this->checkTenant($announcement, $request->user());
        $announcement->update(['status' => 'published', 'published_at' => now()]);
        return response()->json(['message' => 'Announcement published.', 'announcement' => $announcement]);
    }

    private function checkTenant($model, $user): void
    {
        if ($model->institution_id !== $user->institution_id) abort(403);
    }
}
