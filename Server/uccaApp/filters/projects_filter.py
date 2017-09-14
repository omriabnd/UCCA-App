import rest_framework_filters as filters
from django.db.models import Q

from uccaApp.filters.users_filter import UsersFilter
from uccaApp.models import Projects
from uccaApp.models import Users


def created_by_users(self,request):
  query = Users.objects.filter(Q(id=request.created_by) | Q(email=request.created_by) | Q(first_name=request.created_by))
  return query

class ProjectsFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    name = filters.CharFilter(name='name', lookup_type='icontains')
    description = filters.CharFilter(name='description', lookup_type='icontains')
    tooltip = filters.CharFilter(name='tooltip', lookup_type='icontains')
    layer = filters.NumberFilter(name='layer', lookup_type='exact')

    is_default = filters.BooleanFilter(name='is_default', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')

    class Meta:
        model = Projects
        fields = {
            'id',
            'name',
            'description',
            'tooltip',
            'layer',
            'created_by',
            'is_active',
        }
        # TODO: 
        # search User -  LIKE Email || Name || ID
        # search Layer -  LIKE Title || ID