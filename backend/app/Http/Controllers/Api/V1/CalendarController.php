<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Services\NepaliDateService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CalendarController extends Controller
{
    public function __construct(private NepaliDateService $nepDate) {}

    public function events(Request $request): JsonResponse
    {
        $events = CalendarEvent::where('institution_id', $request->user()->institution_id)
            ->when($request->from, fn($q) => $q->whereDate('start_date', '>=', $request->from))
            ->when($request->to,   fn($q) => $q->whereDate('start_date', '<=', $request->to))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->get()
            ->map(fn($e) => $this->formatEvent($e, $request->user()->language ?? 'en'));

        return response()->json(['events' => $events]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'title_ne'   => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'type'       => 'required|in:holiday,exam,event,meeting,other',
            'description'=> 'nullable|string',
            'color'      => 'nullable|string|max:10',
            'all_day'    => 'boolean',
        ]);

        $event = CalendarEvent::create([
            ...$request->only('title','title_ne','start_date','end_date','type','description','color','all_day'),
            'institution_id' => $request->user()->institution_id,
            'created_by'     => $request->user()->id,
        ]);

        return response()->json(['event' => $this->formatEvent($event, $request->user()->language ?? 'en'), 'message' => __('messages.event_created')], 201);
    }

    public function update(Request $request, CalendarEvent $event): JsonResponse
    {
        $event->update($request->only('title','title_ne','start_date','end_date','type','description','color','all_day'));
        return response()->json(['event' => $this->formatEvent($event, $request->user()->language ?? 'en'), 'message' => __('messages.updated')]);
    }

    public function destroy(CalendarEvent $event): JsonResponse
    {
        $event->delete();
        return response()->json(['message' => __('messages.deleted')]);
    }

    public function holidays(Request $request): JsonResponse
    {
        $year     = $request->year ?? now()->year;
        $holidays = CalendarEvent::where('institution_id', $request->user()->institution_id)
            ->where('type', 'holiday')
            ->whereYear('start_date', $year)
            ->get()
            ->map(fn($e) => $this->formatEvent($e, $request->user()->language ?? 'en'));

        return response()->json(['holidays' => $holidays, 'year' => $year]);
    }

    public function convert(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'from' => 'required|in:ad,bs',
        ]);

        if ($request->from === 'ad') {
            $bs = $this->nepDate->adToBs($request->date);
            return response()->json(['ad' => $request->date, 'bs' => $bs, 'bs_formatted' => $this->nepDate->format($bs)]);
        } else {
            $ad = $this->nepDate->bsToAd($request->date);
            return response()->json(['bs' => $request->date, 'ad' => $ad]);
        }
    }

    private function formatEvent(CalendarEvent $event, string $lang): array
    {
        $startBs = $this->nepDate->adToBs($event->start_date);
        return [
            'id'          => $event->id,
            'title'       => $lang === 'ne' && $event->title_ne ? $event->title_ne : $event->title,
            'title_en'    => $event->title,
            'title_ne'    => $event->title_ne,
            'start_date'  => $event->start_date,
            'end_date'    => $event->end_date,
            'start_bs'    => $startBs,
            'start_bs_formatted' => $this->nepDate->format($startBs),
            'type'        => $event->type,
            'description' => $event->description,
            'color'       => $event->color ?? $this->typeColor($event->type),
            'all_day'     => $event->all_day,
        ];
    }

    private function typeColor(string $type): string
    {
        return match($type) {
            'holiday' => '#EF4444',
            'exam'    => '#F59E0B',
            'event'   => '#3B82F6',
            'meeting' => '#8B5CF6',
            default   => '#6B7280',
        };
    }
}
