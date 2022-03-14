from django.contrib import admin

from mgems.models import Prosumer

admin.sites.site.register(
    [
        Prosumer,
    ]
)
