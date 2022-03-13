from django.db import models
from math import radians, cos, sin, asin, sqrt


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


class Microgrid(_ModelMixin, models.Model):
    prosumer = models.ForeignKey("Prosumer", on_delete=models.PROTECT)
    parent_grid = models.ForeignKey("Grid", on_delete=models.PROTECT)


class Prosumer(_ModelMixin, models.Model):
    id = models.TextField(max_length=39, unique=True, primary_key=True)
    grid = models.ForeignKey(Microgrid, on_delete=models.PROTECT)
    max_import_power = models.FloatField()
    max_export_power = models.FloatField()
    is_online = models.BooleanField()
    is_trader = models.BooleanField()
    is_dr_adaptive = models.BooleanField()
    # TODO: add location field
    # TODO: add nearest node field

    @property
    def vp_address(self):
        return self.id

    @property
    def registered_on(self):
        return self.created_at


class __ProsumerSubComponentMixin(_ModelMixin, models.Model):
    prosumer = models.ForeignKey(Prosumer, on_delete=models.PROTECT)
    is_online = models.BooleanField()

    class Meta:
        abstract = True


class DemandResponseAdaptiveEntityMixin(models.Model):
    dr_adaptive = models.BooleanField()

    class Meta:
        abstract = True


class ProsumerEnergyGenerationSystem(__ProsumerSubComponentMixin, models.Model):
    max_power = models.FloatField()
    is_renewable = models.BooleanField()
    type = models.TextField()
    efficiency = models.FloatField()


class ProsumerEnergyConsumptionSystem(__ProsumerSubComponentMixin, DemandResponseAdaptiveEntityMixin, models.Model):
    max_power = models.FloatField()


class ProsumerEnergyStorageSystem(__ProsumerSubComponentMixin, DemandResponseAdaptiveEntityMixin, models.Model):
    max_capacity = models.FloatField()
    usable_capacity = models.FloatField()
    max_charge_rate = models.FloatField()
    max_discharge_rate = models.FloatField()
    type = models.TextField()
