from enum import StrEnum


class OriginalStrEnum(StrEnum):
    """
    A StrEnum that does NOT convert the value to lowercase, but rather uses the original value
    """

    @staticmethod
    def _generate_next_value_(
        name: str, start: int, count: int, last_values: list[str]
    ) -> str:
        return name
