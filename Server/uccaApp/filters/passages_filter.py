# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

import rest_framework_filters as filters

from uccaApp.models import Passages


class PassagesFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    text = filters.CharFilter(name='text', lookup_type='contains')
    type = filters.CharFilter(name='type', lookup_type='exact')
    is_default = filters.BooleanFilter(name='is_default', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')
    source = filters.NumberFilter(name='source', lookup_type='exact')
    class Meta:
        model = Passages
        fields = {
            'id',
            'text',
            'type',
            'source',
            'created_by',
            'is_active',
        }
        # fields = {'name': ['exact','in', 'startswith']}
