"""
Document database that stores product metadata.
"""

from agentools.retrieval.db import (
    EmbeddableDataCollection,
    EmbeddableData,
    EmbeddableField,
)

from .util import OriginalStrEnum

Powertrain = OriginalStrEnum(
    "Powertrain",
    ["EV", "ICE", "Hybrid"],
)

VehicleType = OriginalStrEnum(
    "VehicleType",
    ["Car", "Truck", "SUV", "Van"],
)


class Product(EmbeddableData):
    """
    Product metadata
    """

    # ========= Vehicle Info ========= #
    name: str  # heading
    # description: str
    vehicle_type: VehicleType  # build.body_type
    release_year: int  # build.year
    price_in_usd: float  # price
    is_used: bool  # inventory_type=="used"

    # ========= Technical Specs ========= #
    powertrain_type: Powertrain  # {"EV": build.powertrain_type == "BEV", "ICE": build.powertrain_type == "Combustion", "Hybrid": else}
    # range_in_km: float
    num_seats: int  # build.std_seating
    color: str  # base_ext_color
    # customization_options: list[str]
    specs: dict[str, str]  # build

    # ========= "Soft" data ========= #
    # resale_value: float  # 0-1, high resale value is 1
    # luxury_level: float  # 0-1, high luxury is 1, 0 is maximum value

    image_url: list[str]  # media.photo_links


# TODO: remove me
EmbeddableDataCollection.use_global_client()

product_db = EmbeddableDataCollection("PRODUCT_DB", Product, validate=False)