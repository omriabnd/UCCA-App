# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

import rest_framework_filters as filters

from uccaApp.models import Layers


class LayersFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    parent_layer_id = filters.NumberFilter(name='parent_layer_id', lookup_type='exact')
    name = filters.CharFilter(name='name', lookup_type='contains')
    type = filters.CharFilter(name='type', lookup_type='contains')
    description = filters.CharFilter(name='description', lookup_type='contains')
    tooltip = filters.CharFilter(name='tooltip', lookup_type='contains')
    is_default = filters.BooleanFilter(name='is_default', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')
    class Meta:
        model = Layers
        fields = {
            'id',
            'parent_layer_id',
            'name',
            'type',
            'description',
            'tooltip',
            'is_default',
            'created_by',
            'is_active',
        }
        # TODO: projects , categories
