"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { EventProps, HeadedCalendar, VariantEnum } from "headed-ui";

export default function Page() {
  const { data: session, status } = useSession(); // get session
  const [events, setEvents] = useState<EventProps[]>([]);

  useEffect(() => {
    console.log("Full session:", session);
  console.log("Session user:", session?.user);
  console.log("Providers:", session?.user?.providers);
  console.log("Google:", session?.user?.providers);
    const fetchGoogleCalendarEvents = async () => {
      if (!session?.user?.providers?.google?.accessToken) {
        alert("Please log in to Google");
        return;
      }

      const accessToken = session.user.providers.google.accessToken;

      try {
        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events/',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        console.log(data)
        // Map Google Calendar events to your EventProps format
        const fetchedEvents: EventProps[] = data.items.map((item: any) => ({
          variant: VariantEnum.Primary,
          name: item.summary,
          description: item.description || '',
          date: new Date(item.start.dateTime || item.start.date),
          endDate: new Date(item.end.dateTime || item.end.date),
        }));

        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching Google Calendar events:", error);
      }
    };

    fetchGoogleCalendarEvents();
  }, [session, status]);

  return (
    <div>
      <HeadedCalendar variant={VariantEnum.Primary} events={events} />
    </div>
  );
}