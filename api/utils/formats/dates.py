from datetime import datetime

def date_format_string(date):
    new_date = datetime.fromisoformat(str(date).replace("Z", "+00:00"))
    datetime_string = new_date.strftime("%d/%m/%Y %H:%M:%S")
    return datetime_string
