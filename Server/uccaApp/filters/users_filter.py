# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

import rest_framework_filters as filters

from uccaApp.models import Users


class UsersFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    first_name = filters.CharFilter(name='first_name', lookup_type='contains')
    last_name = filters.CharFilter(name='last_name', lookup_type='contains')
    email = filters.CharFilter(name='email', lookup_type='exact')
    organization = filters.CharFilter(name='organization', lookup_type='contains')
    affiliation = filters.CharFilter(name='affiliation', lookup_type='contains')
    role = filters.CharFilter(name='role__name', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')
    class Meta:
        model = Users
        fields = {
            'id',
            'first_name',
            'last_name',
            'email',
            'organization',
            'affiliation',
            'role__name',
            'is_active',
            'created_by'
        }
        # fields = {'name': ['exact','in', 'startswith']}
