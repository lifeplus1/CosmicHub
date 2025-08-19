import json
from typing import Union

from pydantic import BaseModel, ValidationError


class ChartData(BaseModel):
    """Unified chart data model aligned with frontend TypeScript schema.

    Optional collections (asteroids, angles) are included to keep backend and
    frontend serialization structures consistent while not forcing providers
    to always supply them. We keep the value types permissive (str|float) to
    minimize validation friction for incremental adoption of richer objects.
    """

    planets: list[dict[str, Union[str, float]]]
    houses: list[dict[str, Union[str, float]]]
    aspects: list[
        dict[str, Union[str, float]]
    ]  # allow orb/applying numeric values
    asteroids: list[dict[str, Union[str, float]]] | None = None
    angles: list[dict[str, Union[str, float]]] | None = None


class UserProfile(BaseModel):
    user_id: str
    birth_data: dict[str, str]


class NumerologyData(BaseModel):
    life_path: int
    destiny: int
    personal_year: int


def serialize_data(data: Union[ChartData, UserProfile, NumerologyData]) -> str:
    try:
        return json.dumps(data.model_dump(exclude_unset=True))
    except ValidationError as e:
        raise ValueError(f"Serialization error: {str(e)}")


def deserialize_data(json_str: str, model: type[BaseModel]) -> BaseModel:
    try:
        return model.model_validate_json(json_str)
    except ValidationError as e:
        raise ValueError(f"Deserialization error: {str(e)}")
