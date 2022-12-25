"""
This file includes all the functionality
for the wedding_api_client.
"""
# pylint: disable=too-few-public-methods
import abc
import json

import requests
from requests import Response

from client import ApiErrorException
from client.models import Present, Confirmation


class _BaseClient(abc.ABC):
    """
    The base client for the Python weddingApi client.
    All helper functions and rest (low-level) functions are
    implemented in this class.
    """

    def __init__(self, base_url: str, stage: str, password: str, http_client=requests):
        self.base_url = base_url
        self.stage = stage
        self.password = password
        self.http_client = http_client

    # Helper functions

    def __build_headers(self):
        """
        Builds the headers for each request.
        :return: dict
        """
        return {"Authorization": self.password, "Content-Type": 'application/json'}

    def __build_path(self, path: str):
        """
        Returns the url-path as string.
        :param path: path
        :return: str
        """
        return f"{self.base_url}/{self.stage}{path}"

    # --------------------- REST FUNCTIONS ---------------------------

    def _get_presents_rest(self) -> Response:
        """
        Internal rest function for `GET /confirmations`
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/presents")
        print(path)
        print(headers)
        return self.http_client.get(path, headers=headers)

    def _post_present_rest(self, present_dict: dict) -> Response:
        """
        Internal rest function for `POST /confirmations`
        :param present_dict: present dictionary
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/presents")
        return self.http_client.post(path, headers=headers, data=json.dumps(present_dict))

    def _put_present_rest(self, present_dict: dict) -> Response:
        """
        Internal rest function for `PUT /confirmations`
        :param present_dict: present dictionary
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/presents")
        return self.http_client.post(path, headers=headers, data=json.dumps(present_dict))

    def _delete_present_rest(self, present_id: str) -> Response:
        """
        Internal rest function for
        `DELETE /confirmations?confirmation_id={ID}`
        :param present_id: present_id as string
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/presents")
        return self.http_client.delete(path, headers=headers, params={"presentId": present_id})

    def _get_confirmations_rest(self) -> Response:
        """
        Internal rest function for `GET /confirmations`
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/confirmations")
        return self.http_client.get(path, headers=headers)

    def _post_confirmation_rest(self, confirmation_dict: dict) -> Response:
        """
        Internal rest function for `POST /confirmations`
        :param confirmation_dict: present dictionary
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/confirmations")
        payload = json.dumps(confirmation_dict)
        print(payload)
        print(path)
        print(headers)
        print(confirmation_dict)
        return self.http_client.post(path, headers=headers, data=payload)

    def _put_confirmation_rest(self, confirmation_dict: dict) -> Response:
        """
        Internal rest function for `PUT /confirmations`
        :param confirmation_dict: present dictionary
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/confirmations")
        return self.http_client.post(path, headers=headers, data=json.dumps(confirmation_dict))

    def _delete_confirmation_rest(self, confirmation_id: str) -> Response:
        """
        Internal rest function for
        `DELETE /confirmations?confirmation_id={ID}`
        :param confirmation_id: present_id as string
        :return: Response
        """
        headers = self.__build_headers()
        path = self.__build_path("/confirmations")
        return self.http_client.delete(path,
                                       headers=headers,
                                       params={
                                           "confirmationId": confirmation_id
                                       })


class GuestWeddingApiClient(_BaseClient):
    """
    This client contains all the functionality
    for the Wedding Client with Guest functionality.
    """

    # Presents API Calls
    def get_presents(self) -> list[Present]:
        """
        API call to `GET /presents`
        :return: list of Presents
        :raises ApiErrorException
        """
        response = self._get_presents_rest()
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)
        return [Present.from_dict(prop) for prop in response.json()]

    def update_present(self, present: Present) -> None:
        """
        API call to `PUT /presents`
        :param present: Present object
        :return: None
        :raises ApiErrorException
        """
        self._put_present_rest(present.to_dict())

    def create_confirmation(self, confirmation: Confirmation) -> None:
        """
        API call to `POST /confirmations`
        :param confirmation: Confirmation object
        :return: None
        :raises ApiErrorException
        """
        response = self._post_confirmation_rest(confirmation.to_dict())
        print(response)
        print(response.request.headers)
        print(response.request.body)
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)
        return response.json()['confirmationId']


class DashboardWeddingApiClient(_BaseClient):
    """
    This client contains all the functionality
    for the Wedding Client with Guest functionality.
    """

    def create_present(self, present: Present) -> None:
        """
        API call to `POST /presents`
        :param present: Present object
        :return: None
        :raises ApiErrorException
        """
        response = self._post_present_rest(present.to_dict())
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)
        print(response)
        print(response.json())
        return response.json()['present_id']

    def delete_present(self, present_id: str) -> None:
        """
        API call to `DELETE /presents?presentId={present_id}`
        :param present_id: str
        :return: None
        :raises ApiErrorException
        """
        response = self._delete_present_rest(present_id)
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)

    # Confirmation API Calls
    def get_confirmations(self) -> list[Confirmation]:
        """
        API call to `GET /confirmations`
        :return: list of confirmations
        :raises ApiErrorException
        """
        response = self._get_confirmations_rest()
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)
        return [Confirmation.from_dict(prop) for prop in response.json()]

    def update_confirmation(self, confirmation: Confirmation) -> None:
        """
        API call to `PUT /confirmations`
        :param confirmation: Confirmation object
        :return: None
        :raises ApiErrorException
        """
        response = self._put_confirmation_rest(confirmation.to_dict())
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)

    def delete_confirmation(self, confirmation_id: str) -> None:
        """
        API call to `DELETE /confirmations?confirmationId={confirmation_id}`
        :param confirmation_id: str
        :return: None
        :raises ApiErrorException
        """
        response = self._delete_confirmation_rest(confirmation_id)
        print(response)
        if response.status_code > 301:
            raise ApiErrorException.from_response(response)
