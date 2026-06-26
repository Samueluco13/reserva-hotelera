import datetime
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar"]

"""
Accede a las credenciales, si no hay archivo o no son validas, verifica que
se puedan renovar y lo hace.
En el else accede al archivo descargado desde la consola de google para
obtener las credenciales y crear el archivo 'token.josn'
"""
def _authenticate():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
            "calendar_desktop_credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=8080, open_browser=True)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    #Devuelve un objeto de calendar desde del cual podemos acceder al las acciones de la API
    return build("calendar", "v3", credentials=creds)

def create_event(summary: int, start_time: datetime, end_time: datetime, timezone: str, attendees: list[str]):
    event_data = {
        "summary": f"Reservation room {summary}",
        "start": {
            "dateTime": start_time.strftime('%Y-%m-%dT%H:%M:%S'),
            "timeZone": timezone
        },
        "end": {
            "dateTime": end_time.strftime('%Y-%m-%dT%H:%M:%S'),
            "timeZone": timezone
        }
    }

    if attendees:
        event_data["attendees"] = [{"email": email} for email in attendees]
        print(event_data["attendees"])
    try:
        calendar_service = _authenticate()
        event = calendar_service.events().insert(calendarId='primary', body=event_data, sendUpdates="all").execute()
        return event
    except HttpError as e:
        print(f"Ha ocurrido un error:\n{e}")

def get_upcoming_events():
    now = datetime.datetime.now().isoformat() + "Z"
    next_week = (datetime.datetime.now() + datetime.timedelta(days=6)).replace(hour=23, minute=59, second=59, microsecond=0).isoformat() + "Z"

    calendar_service = _authenticate()
    events = calendar_service.events().list(
        calendarId="primary",
        timeMin = now,
        timeMax = next_week,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    events_list = events.get("items", [])
    if not events_list:
        print("There is no upcoming events in 7 days")
    else:
        print([{"Evento": event["summary"],
                "Check In": event["start"].get("dateTime"),
                "Check Out": event["end"].get("dateTime")} for event in events_list])
        return events_list
    
def update_event(event_id, summary=None, start_time=None, end_time=None):
    calendar_service = _authenticate()
    event = calendar_service.events().get(calendarId="primary", eventId=event_id).execute()

    if summary:
        event['summary'] = f"Reservation room {summary}"

    if start_time:
        event['start']['dateTime'] = start_time.strftime('%Y-%m-%dT%H:%M:%S')

    if end_time:
        event['end']['dateTime'] = end_time.strftime('%Y-%m-%dT%H:%M:%S')

    updated_event = calendar_service.events().update(
        calendarId = "primary",
        eventId = event_id,
        body = event
    ).execute()

    return updated_event

def delete_event(event_id):
    calendar_service = _authenticate()

    calendar_service.events().delete(calendarId = "primary", eventId = event_id).execute()

    return {"message": "Event deleted successfully"}