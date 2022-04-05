from math import asin, cos, radians, sin, sqrt
from typing import List

from django.contrib.postgres.operations import CreateExtension
from django.db import migrations, models


class Migration(migrations.Migration):

    operations = [CreateExtension("postgis"), ...]


class _ModelMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def get_fields(self):
        return [(field.verbose_name, field.value_from_object(self)) for field in self.__class__._meta.fields]

    def delete(self, *args, **kwargs):
        self.deleted = True
        self.save()


class Prosumer(_ModelMixin, models.Model):
    id = models.TextField(max_length=39, unique=True, primary_key=True)
    max_import_power = models.FloatField()
    max_export_power = models.FloatField()
    is_online = models.BooleanField()
    is_trader = models.BooleanField()
    is_dr_adaptive = models.BooleanField()
    # TODO: add location field
    # TODO: add nearest node field

    @property
    def vp_address(self) -> str:
        return self.id

    @property
    def registered_on(self):
        return self.created_at

    @property
    def energy_consumption_systems(self) -> List["ProsumerEnergyConsumptionSystem"]:
        ProsumerEnergyConsumptionSystem.objects.get(prosumer=self)

    @property
    def energy_generation_systems(self) -> List["ProsumerEnergyGenerationSystem"]:
        ProsumerEnergyGenerationSystem.objects.get(prosumer=self)

    @property
    def energy_storage_systems(self) -> List["ProsumerEnergyStorageSystem"]:
        ProsumerEnergyStorageSystem.objects.get(prosumer=self)


class DemandResponseAdaptiveEntityMixin(models.Model):
    dr_adaptive = models.BooleanField()

    class Meta:
        abstract = True


class ProsumerEnergyGenerationSystem(models.Model):
    prosumer = models.ForeignKey(Prosumer, on_delete=models.PROTECT, related_name="generations")
    is_online = models.BooleanField()

    max_power = models.FloatField()
    is_renewable = models.BooleanField()
    type = models.TextField()
    efficiency = models.FloatField()


class ProsumerEnergyConsumptionSystem(DemandResponseAdaptiveEntityMixin, models.Model):
    prosumer = models.ForeignKey(Prosumer, on_delete=models.PROTECT, related_name="consumptions")
    is_online = models.BooleanField()

    max_power = models.FloatField()


class ProsumerEnergyStorageSystem(DemandResponseAdaptiveEntityMixin, models.Model):
    prosumer = models.ForeignKey(Prosumer, on_delete=models.PROTECT, related_name="storages")
    is_online = models.BooleanField()

    max_capacity = models.FloatField()
    usable_capacity = models.FloatField()
    max_charge_rate = models.FloatField()
    max_discharge_rate = models.FloatField()
    type = models.TextField()
