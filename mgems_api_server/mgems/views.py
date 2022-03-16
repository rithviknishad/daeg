from django_filters.rest_framework import (
    DjangoFilterBackend,
    FilterSet,
    CharFilter,
    BooleanFilter,
    DateTimeFromToRangeFilter,
    ChoiceFilter,
    NumberFilter,
)
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from mgems.models import Prosumer
from mgems.serializers import ProsumerSerialzier


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
