from django.db import models
from math import radians, cos, sin, asin, sqrt


class GeoLocation(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

    class Meta:
        unique_together = "latitude", "longitude"

    @staticmethod
    def distance_between(a: "GeoLocation", b: "GeoLocation"):
        """Finds the ground distance between two geographic location."""
        lat1, lon1, lat2, lon2 = radians(a.latitude), radians(a.longitude), radians(b.latitude), radians(b.longitude)

        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2

        c = 2 * asin(sqrt(a))

        # Radius of earth in kilometers. Use 3956 for miles
        r = 6371

        # calculate the result
        return c * r
