import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeZoneConfig {
  name: string;
  nameZh: string;
  timezone: string;
}

const timeZones: TimeZoneConfig[] = [
  { name: "Los Angeles", nameZh: "洛杉矶", timezone: "America/Los_Angeles" },
  { name: "New York", nameZh: "纽约", timezone: "America/New_York" },
  { name: "London", nameZh: "伦敦", timezone: "Europe/London" },
  { name: "Paris", nameZh: "巴黎", timezone: "Europe/Paris" },
  { name: "Dubai", nameZh: "迪拜", timezone: "Asia/Dubai" },
  { name: "Hong Kong", nameZh: "香港", timezone: "Asia/Hong_Kong" },
  { name: "Tokyo", nameZh: "东京", timezone: "Asia/Tokyo" },
  { name: "Sydney", nameZh: "悉尼", timezone: "Australia/Sydney" },
];

export function WorldClock() {
  const { language, t } = useLanguage();
  const [times, setTimes] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = new Map<string, string>();
      const now = new Date();
      
      timeZones.forEach((tz) => {
        const timeString = now.toLocaleTimeString('en-US', {
          timeZone: tz.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
        newTimes.set(tz.timezone, timeString);
      });
      
      setTimes(newTimes);
    };

    // Update immediately
    updateTimes();
    
    // Update every second
    const interval = setInterval(updateTimes, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('worldClock.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {timeZones.map((tz) => (
            <div
              key={tz.timezone}
              className="flex flex-col items-center p-3 rounded-md border border-border hover-elevate"
              data-testid={`clock-${tz.timezone}`}
            >
              <div className="text-2xl font-bold font-mono tabular-nums" data-testid={`time-${tz.timezone}`}>
                {times.get(tz.timezone) || "00:00:00"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {language === 'zh' ? tz.nameZh : tz.name}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
