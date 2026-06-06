<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = Message::with('sender','recipient')
            ->where('institution_id', $request->user()->institution_id)
            ->where(fn($q) => $q->where('sender_id', $request->user()->id)->orWhere('recipient_id', $request->user()->id))
            ->latest()->paginate(20);
        return response()->json($messages);
    }

    public function send(Request $request): JsonResponse
    {
        $request->validate(['recipient_id' => 'required|exists:users,id',
            'body' => 'required|string', 'subject' => 'nullable|string|max:255']);
        $msg = Message::create([...$request->only('recipient_id','body','subject'),
            'institution_id' => $request->user()->institution_id,
            'sender_id' => $request->user()->id]);
        return response()->json(['message' => $msg->load('sender','recipient'), 'status' => __('messages.created')], 201);
    }

    public function show(Request $request, Message $message): JsonResponse
    {
        if ($message->recipient_id === $request->user()->id && !$message->is_read) {
            $message->update(['is_read' => true, 'read_at' => now()]);
        }
        return response()->json(['message' => $message->load('sender','recipient')]);
    }

    public function markRead(Request $request, Message $message): JsonResponse
    {
        $message->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['message' => 'Marked as read.']);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = Message::where('recipient_id', $request->user()->id)->where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }
}
