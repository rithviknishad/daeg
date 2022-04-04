from dataclasses import field
from rest_framework.serializers import ModelSerializer

from mgems.models import (
    Prosumer,
    ProsumerEnergyGenerationSystem,
    ProsumerEnergyConsumptionSystem,
    ProsumerEnergyStorageSystem,
)


class ProsumerEnergyGenerationSystemSerialier(ModelSerializer):
    """Serializer for Prosumer Energy Generation System Model"""

    class Meta:
        model = ProsumerEnergyGenerationSystem
        fields = ("id", "max_power", "is_renewable", "type", "efficiency")


class ProsumerEnergyConsumptionSystem(ModelSerializer):
    """Serializer for Prosumer Energy Consumption System Model"""

    class Meta:
        model = ProsumerEnergyConsumptionSystem
        fields = ("id", "max_power")


class ProsumerEnergyStorageSystem(ModelSerializer):
    """Serializer for Prosumer Energy Storage System model"""

    class Meta:
        model = ProsumerEnergyStorageSystem
        fields = ("id", "max_capacity", "usable_capacity", "max_charge_rate", "max_discharge_rate", "type")


class ProsumerSerialzier(ModelSerializer):
    """Serializer for Prosumer Model"""

    # generations = ProsumerEnergyGenerationSystemSerialier(many=True)
    # consumptions = ProsumerEnergyConsumptionSystem(many=True)
    # storages = ProsumerEnergyStorageSystem(many=True)

    class Meta:
        model = Prosumer
        fields = (
            "id",
            "max_import_power",
            "max_export_power",
            "is_online",
            "is_trader",
            "is_dr_adaptive",
        )
