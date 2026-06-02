<?php

namespace App\Services;

class NepaliDateService
{
    // BS year data: [total_days, days_in_each_month x12]
    private array $bsData = [
        2000 => [365, 30,32,31,32,31,30,30,30,29,30,29,31],
        2001 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2002 => [365, 31,31,32,32,31,30,30,29,30,29,30,30],
        2003 => [366, 31,32,31,32,31,30,30,30,29,29,30,31],
        2004 => [365, 30,32,31,32,31,30,30,30,29,30,29,31],
        2005 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2006 => [365, 31,31,32,32,31,30,30,29,30,29,30,30],
        2007 => [366, 31,32,31,32,31,30,30,30,29,29,30,31],
        2008 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2009 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2010 => [365, 31,32,31,32,31,30,30,30,29,29,30,30],
        2020 => [365, 31,32,31,32,31,30,30,30,29,30,29,31],
        2070 => [365, 31,32,31,32,31,30,30,30,29,30,29,31],
        2071 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2072 => [366, 31,32,31,32,31,30,30,30,29,29,30,31],
        2073 => [365, 31,32,31,32,31,30,30,30,29,30,29,31],
        2074 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2075 => [365, 31,32,31,32,31,30,30,29,30,29,30,30],
        2076 => [365, 31,32,31,32,31,30,30,30,29,29,30,31],
        2077 => [366, 30,32,31,32,31,30,30,30,29,30,29,31],
        2078 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2079 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2080 => [366, 31,32,31,32,31,30,30,30,29,29,30,31],
        2081 => [365, 31,32,31,32,31,30,30,30,29,30,29,31],
        2082 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2083 => [365, 31,31,32,31,31,31,30,29,30,29,30,30],
        2084 => [366, 31,32,31,32,31,30,30,30,29,29,30,31],
        2085 => [365, 31,32,31,32,31,30,30,30,29,30,29,31],
    ];

    // Nepali months
    private array $monthsNe = ['बैशाख','जेठ','असार','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुन','चैत्र'];
    private array $monthsEn = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];

    // Reference: 2000/1/1 BS = 1943/4/14 AD
    private string $adEpoch = '1943-04-14';
    private array  $bsEpoch = [2000, 1, 1];

    public function adToBs(string $adDate): array
    {
        $ad   = \DateTime::createFromFormat('Y-m-d', $adDate);
        $ref  = \DateTime::createFromFormat('Y-m-d', $this->adEpoch);
        $diff = (int) $ref->diff($ad)->days;

        [$bsY, $bsM, $bsD] = $this->bsEpoch;
        while ($diff > 0) {
            $daysInMonth = $this->daysInMonth($bsY, $bsM);
            if ($diff >= $daysInMonth) {
                $diff -= $daysInMonth;
                $bsM++;
                if ($bsM > 12) { $bsM = 1; $bsY++; }
            } else {
                $bsD += $diff;
                $diff = 0;
            }
        }
        return ['year' => $bsY, 'month' => $bsM, 'day' => $bsD];
    }

    public function bsToAd(string|array $bs): string
    {
        if (is_string($bs)) {
            [$bsY, $bsM, $bsD] = array_map('intval', explode('-', $bs));
        } else {
            ['year' => $bsY, 'month' => $bsM, 'day' => $bsD] = $bs;
        }

        [$refY, $refM, $refD] = $this->bsEpoch;
        $totalDays = 0;

        for ($y = $refY; $y < $bsY; $y++) {
            $totalDays += array_sum(array_slice($this->bsData[$y] ?? $this->bsData[2082], 1));
        }
        for ($m = $refM; $m < $bsM; $m++) {
            $totalDays += $this->daysInMonth($bsY, $m);
        }
        $totalDays += $bsD - $refD;

        $ad = \DateTime::createFromFormat('Y-m-d', $this->adEpoch);
        $ad->modify("+{$totalDays} days");
        return $ad->format('Y-m-d');
    }

    public function format(array $bs, bool $devanagari = false): string
    {
        $month = $devanagari ? $this->monthsNe[$bs['month'] - 1] : $this->monthsEn[$bs['month'] - 1];
        $day   = $devanagari ? $this->toDevanagari($bs['day']) : $bs['day'];
        $year  = $devanagari ? $this->toDevanagari($bs['year']) : $bs['year'];
        return "{$year} {$month} {$day}";
    }

    public function today(): array
    {
        return $this->adToBs(now()->format('Y-m-d'));
    }

    public function toDevanagari(int $number): string
    {
        $map = ['0'=>'०','1'=>'१','2'=>'२','3'=>'३','4'=>'४','5'=>'५','6'=>'६','7'=>'७','8'=>'८','9'=>'९'];
        return strtr((string)$number, $map);
    }

    public function getMonthName(int $month, bool $nepali = false): string
    {
        return $nepali ? $this->monthsNe[$month - 1] : $this->monthsEn[$month - 1];
    }

    private function daysInMonth(int $bsYear, int $bsMonth): int
    {
        $data = $this->bsData[$bsYear] ?? $this->bsData[2082];
        return $data[$bsMonth];
    }
}
