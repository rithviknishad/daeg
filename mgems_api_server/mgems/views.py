from django_filters.rest_framework import (
    DjangoFilterBackend,
    FilterSet,
    CharFilter,
    BooleanFilter,
    DateTimeFromToRangeFilter,
    ChoiceFilter,
    NumberFilter,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from mgems.models import Prosumer


class ProsumerSerialzier(ModelSerializer):
    """Serializer for Prosumer"""

    class Meta:
        model = Prosumer
        fields = ("id", "max_import_power", "max_export_power", "is_online", "is_trader", "is_dr_adaptive")


class ProsumerFilter(FilterSet):
    """Filter sets for Prosumers"""

    id = CharFilter(lookup_expr="icontains")


class ProsumerViewSet(ModelViewSet):
    """Model View Set for Prosumer"""

    queryset = Prosumer.objects.all()
    serializer_class = ProsumerSerialzier
    filter_backends = (DjangoFilterBackend,)
    filterset_class = ProsumerFilter

    def get_queryset(self):
        return super().get_queryset()
