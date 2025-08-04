import {EventProps} from "@/components/calendar/event-props";
import {googleApi} from "@/lib/api-client";

export async function handleCreateEvent(event: EventProps, options: {
  calendarId?: string;
  timeZone?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
} = {}) {
  const {
    calendarId = 'primary',
    timeZone = 'Europe/London',
    onSuccess,
    onError,
  } = options;

  try {
    const response = await googleApi.calendar.createEvent({
      calendarId,
      summary: event.name,
      // description: event.description,
      start: {
        dateTime: event.date,
        timeZone,
      },
      end: {
        dateTime: event.endDate || new Date(event.date.getTime() + 3600 * 1000),
        timeZone,
      },
    });
    console.log(response.success);
    if (onSuccess) onSuccess();
  } catch (error) {
    if (onError) onError(error);
    else throw error; // fallback: rethrow if no handler
  }
}