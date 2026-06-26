from fastapi import Request
from fastapi.responses import JSONResponse

class DateRangeBase(Exception):
    status_code = 409
    def __init__(self, message):
        self.message = message
        super().__init__(message)

class UnavailableDateRange(DateRangeBase):
    def __init__(self):
        super().__init__("The reservation range is not available")

class InvalidDateRangeOrder(DateRangeBase):
    status_code = 400
    def __init__(self):
        super().__init__("The check-out date must be after the check-in date")

def date_range_handler(request: Request, date_range: DateRangeBase):
    return JSONResponse(
        content={"message": date_range.message },
        status_code=date_range.status_code
    )