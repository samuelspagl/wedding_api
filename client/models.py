"""
This file includes all the models for the WeddingAPI.
"""
from dataclasses import dataclass
from requests import Response

from .error import ApiErrorException


@dataclass
class Present:
    """
    Representation of a present.
    """
    present_id: str
    present_title: str
    img_url: str
    product_url: str
    bought: bool

    @staticmethod
    def from_response(resp: Response) -> "Present":
        """
        Creates a Present object from a response.
        :param resp: Response
        :return: Present
        :raises ApiErrorException
        """
        if resp.status_code > 301:
            raise ApiErrorException.from_response(resp)
        return Present.from_dict(resp.json())

    @staticmethod
    def from_dict(json: dict) -> "Present":
        """
        Creates a Present object from a dictionary.
        :param json: json dictionary
        :return: Present
        :raises ApiErrorException
        """
        return Present(present_id=json['presentId'],
                       present_title=json['presentTitle'],
                       img_url=json['imgUrl'],
                       product_url=json['productUrl'],
                       bought=json['bought'])

    def to_dict(self) -> dict:
        """
        Converts the present to a dict.
        :return: dict
        """
        present_dict = {
            "present_title": self.present_title,
            "img_url": self.img_url,
            "product_url": self.product_url,
            "bought": self.bought
        }
        if self.present_id is not None:
            present_dict['present_id'] = self.present_id
        return present_dict


@dataclass
class Confirmation:
    """
    Representation of a confirmation.
    """
    confirmation_id: str
    name: str
    surname: str
    attending: bool
    eating: str
    allergies: str
    textfield: str

    @staticmethod
    def from_response(resp: Response) -> "Confirmation":
        """
        Creates a Present object from a response.
        :param resp: Response
        :return: Present
        :raises ApiErrorException
        """
        if resp.status_code < 301:
            raise ApiErrorException.from_response(resp)
        return Confirmation.from_dict(resp.json())

    @staticmethod
    def from_dict(json: dict) -> "Confirmation":
        """
        Creates a Present object from a dictionary.
        :param json: json dictionary
        :return: Present
        """
        return Confirmation(confirmation_id=json['confirmationId'],
                            name=json['name'],
                            surname=json['surname'],
                            attending=json['attending'],
                            eating=json['eating'],
                            allergies=json['allergies'],
                            textfield=json['textfield'])

    def to_dict(self) -> dict:
        """
        Returns a json dictionary.
        :return: dict
        """
        confirmation_dict = {
            "name": self.name,
            "surname": self.surname,
            "attending": self.attending,
            "eating": self.eating,
            "allergies": self.allergies,
            "textfield": self.textfield
        }
        if self.confirmation_id is not None:
            confirmation_dict['confirmationId'] = self.confirmation_id
        return confirmation_dict
