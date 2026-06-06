<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\Institution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $institution = Institution::findOrFail($request->user()->institution_id);
        $settings    = Setting::where('institution_id', $request->user()->institution_id)->pluck('value','key');
        return response()->json(['institution' => $institution, 'settings' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $institution = Institution::findOrFail($request->user()->institution_id);
        $institution->update($request->only('name','name_ne','address','city','district','province','phone','email','currency','timezone','language','theme_color','slogan','slogan_ne'));
        if ($request->settings) {
            foreach ($request->settings as $key => $value) {
                Setting::updateOrCreate(['institution_id' => $institution->id, 'key' => $key], ['value' => $value]);
            }
        }
        return response()->json(['institution' => $institution, 'message' => __('messages.updated')]);
    }

    public function getGrading(Request $request): JsonResponse
    {
        $grading = Setting::where('institution_id', $request->user()->institution_id)->where('key','grading_scale')->first();
        $default = [['grade'=>'A+','gpa'=>4.0,'min'=>90,'max'=>100],['grade'=>'A','gpa'=>3.6,'min'=>80,'max'=>89],
            ['grade'=>'B+','gpa'=>3.2,'min'=>70,'max'=>79],['grade'=>'B','gpa'=>2.8,'min'=>60,'max'=>69],
            ['grade'=>'C+','gpa'=>2.4,'min'=>50,'max'=>59],['grade'=>'C','gpa'=>2.0,'min'=>40,'max'=>49],
            ['grade'=>'D','gpa'=>1.6,'min'=>35,'max'=>39],['grade'=>'F','gpa'=>0.0,'min'=>0,'max'=>34]];
        return response()->json(['grading' => $grading ? json_decode($grading->value, true) : $default]);
    }

    public function updateGrading(Request $request): JsonResponse
    {
        $request->validate(['grading' => 'required|array']);
        Setting::updateOrCreate(['institution_id' => $request->user()->institution_id, 'key' => 'grading_scale'],
            ['value' => json_encode($request->grading)]);
        return response()->json(['message' => 'Grading scale updated.']);
    }
}
