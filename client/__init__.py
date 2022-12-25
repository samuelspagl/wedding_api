"""
#####################################################
#                                                   #
#             wedding_api Python client             #
#                                                   #
#####################################################

Introduction:
This is WeddingClient
"""

from .error import ApiError, ApiErrorException
from .wedding_api_client import GuestWeddingApiClient, DashboardWeddingApiClient
from .models import Confirmation, Present
