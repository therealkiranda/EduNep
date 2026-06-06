<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\LibraryBook;
use App\Models\BookBorrow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LibraryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $books = LibraryBook::where('institution_id', $request->user()->institution_id)
            ->when($request->search, fn($q) => $q->where('title','like',"%{$request->search}%")
                ->orWhere('author','like',"%{$request->search}%")->orWhere('isbn','like',"%{$request->search}%"))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->latest()->paginate(20);
        return response()->json($books);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['title' => 'required|string|max:255', 'total_copies' => 'required|integer|min:1']);
        $book = LibraryBook::create([...$request->only('title','author','isbn','category','publisher','published_year','total_copies','location'),
            'institution_id' => $request->user()->institution_id, 'available_copies' => $request->total_copies]);
        return response()->json(['book' => $book, 'message' => __('messages.created')], 201);
    }

    public function show(LibraryBook $libraryBook): JsonResponse { return response()->json(['book' => $libraryBook]); }

    public function update(Request $request, LibraryBook $libraryBook): JsonResponse
    {
        $libraryBook->update($request->only('title','author','isbn','category','publisher','location'));
        return response()->json(['book' => $libraryBook, 'message' => __('messages.updated')]);
    }

    public function destroy(LibraryBook $libraryBook): JsonResponse { $libraryBook->delete(); return response()->json(['message' => __('messages.deleted')]); }

    public function borrow(Request $request): JsonResponse
    {
        $request->validate(['book_id' => 'required|exists:library_books,id', 'user_id' => 'required|exists:users,id',
            'due_date' => 'required|date|after:today']);
        $book = LibraryBook::findOrFail($request->book_id);
        if ($book->available_copies < 1) return response()->json(['message' => 'No copies available.'], 422);
        $borrow = BookBorrow::create(['book_id' => $book->id, 'user_id' => $request->user_id,
            'institution_id' => $request->user()->institution_id,
            'borrowed_date' => today(), 'due_date' => $request->due_date, 'status' => 'borrowed']);
        $book->decrement('available_copies');
        return response()->json(['borrow' => $borrow->load('book'), 'message' => 'Book borrowed successfully.'], 201);
    }

    public function returnBook(Request $request): JsonResponse
    {
        $request->validate(['borrow_id' => 'required|exists:book_borrows,id']);
        $borrow = BookBorrow::findOrFail($request->borrow_id);
        $fine   = 0;
        if (now()->isAfter($borrow->due_date)) {
            $days = now()->diffInDays($borrow->due_date);
            $fine = $days * 5; // NPR 5 per day
        }
        $borrow->update(['returned_date' => today(), 'fine' => $fine, 'status' => 'returned']);
        $borrow->book->increment('available_copies');
        return response()->json(['message' => 'Book returned.', 'fine' => $fine, 'borrow' => $borrow]);
    }

    public function overdue(Request $request): JsonResponse
    {
        $overdue = BookBorrow::with('book','user')
            ->where('institution_id', $request->user()->institution_id)
            ->where('status','borrowed')->where('due_date','<', today())->get();
        return response()->json(['overdue' => $overdue, 'count' => $overdue->count()]);
    }

    public function borrowed(Request $request): JsonResponse
    {
        $borrowed = BookBorrow::with('book','user')
            ->where('institution_id', $request->user()->institution_id)
            ->where('status','borrowed')->latest()->get();
        return response()->json(['borrowed' => $borrowed]);
    }
}
