import rest_framework_filters as filters

from uccaApp.models import Sources


class SourcesFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    text = filters.CharFilter(name='text', lookup_type='icontains')
    name = filters.CharFilter(name='name', lookup_type='icontains')
    is_default = filters.BooleanFilter(name='is_default', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')
    source = filters.NumberFilter(name='source', lookup_type='exact')
    class Meta:
        model = Sources
        fields = {
            'id',
            'text',
            'name',
            'created_by',
            'is_active',
        }
        # fields = {'name': ['exact','in', 'startswith']}
