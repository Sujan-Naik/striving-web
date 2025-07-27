"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {HeadedAccordion, HeadedCalendar, VariantEnum} from "headed-ui";

interface MailItem {
  id: string;
  subject: string;
  snippet: string;
  sender: string;
  date: Date;
}

export default function Page() {
  const { data: session, status } = useSession();
  const [mail, setMail] = useState<MailItem[]>([]);

  useEffect(() => {
    const fetchGoogleMail = async () => {
      if (!session?.user?.providers?.google?.accessToken) {
        alert("Please log in to Google");
        return;
      }

      const accessToken = session.user.providers.google.accessToken;
      try {
        const response = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages',
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
        const messageIds = data.messages || [];
        console.log(messageIds)

        const messages: MailItem[] = [];

        for (const item of messageIds) {
          const msgResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (msgResponse.ok) {
            const msgData = await msgResponse.json();
            const headers = msgData.payload.headers;
            const subjectHeader = headers.find((h: { name: string; }) => h.name === 'Subject');
            const fromHeader = headers.find((h: { name: string; }) => h.name === 'From');
            const dateHeader = headers.find((h: { name: string; }) => h.name === 'Date');

            messages.push({
              id: item.id,
              subject: subjectHeader?.value || '(No Subject)',
              snippet: msgData.snippet,
              sender: fromHeader?.value || '(Unknown sender)',
              date: new Date(dateHeader?.value || Date.now()),
            });
          }
        }

        setMail(messages);
      } catch (error) {
        console.error("Error fetching Gmail messages:", error);
      }
    };

    fetchGoogleMail();
  }, [session, status]);

  return (
    <div>
                <div>
          {mail.length === 0 ? (
            <p>No mail to display.</p>
          ) : (
            <ul>
              {mail.map((item) => (
                <li key={item.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{item.subject}</h3>
                  <p style={{ margin: '0 0 5px 0' }}><strong>From:</strong> {item.sender}</p>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {item.date.toLocaleString()}</p>
                  <p style={{ margin: 0 }}>{item.snippet}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
    </div>
  );
}