export type GoogleCalendarEvent = {
  summary: string;
  time: string;
  startTime: string;
};
if (!process.env.N8N_HOST || !process.env.N8N_WEBHOOK_CALENDAR) {
  throw new Error(
    "Please provide all the necessary environment variables for the N8N API connection"
  );
}
const n8nWebhookCalendar =
  process.env.N8N_HOST + process.env.N8N_WEBHOOK_CALENDAR;

export const getCalendarEventsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<GoogleCalendarEvent[]> => {
  try {
    const resp = await fetch(n8nWebhookCalendar, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start: startDate,
        end: endDate,
      }),
    });
    return await resp.json();
    //   .then(async (res) => await res.json())
    //   .then((data) => {
    //     console.log(data);
    //     return data;
    //   });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
