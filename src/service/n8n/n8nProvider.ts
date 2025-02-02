const n8nWebhookCalendar =
  "https://n8nmm.cytr.us/webhook/7e93d1d2-cc8e-481b-bbd2-0e2fb6373aa0";
export type GoogleCalendarEvent = {
  summary: string;
  time: string;
  startTime: string;
};

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
