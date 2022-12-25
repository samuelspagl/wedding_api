"""
Hallo
"""
from dataclasses import dataclass
from enum import Enum
from requests import Response


class ErrorCode(Enum):
    """
    Enum for error codes.
    """
    UNAUTHORIZED = 401
    TYPE_MISMATCH = 400
    SERVER_ERROR = 500
    NOT_FOUND = 404


@dataclass
class ApiError:
    """
    Api error class.
    """
    code: ErrorCode
    message: str | None

    def __str__(self) -> str:
        return f"HTTP STATUS CODE {self.code}" + (
            "" if self.message is None else f": {self.message}"
        )


@dataclass
class ApiErrorException(Exception):
    """
    This is the Exception being thrown by an HTTP error code.
    """

    def __init__(self, error: ApiError):
        self.api_error = error

    def __str__(self) -> str:
        return str(self.api_error)

    def __repr__(self) -> str:
        return f"ServiceErrorException({self.api_error})"

    @staticmethod
    def from_response(resp: Response):
        """
        Creates a ApiErrorException from a response object.
        :param resp:
        :return:
        """
        return ApiErrorException(
            ApiError(
                ErrorCode(resp.status_code), resp.json().get('error', None)
            ))
