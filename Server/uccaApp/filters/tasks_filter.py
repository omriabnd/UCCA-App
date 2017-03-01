# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

import rest_framework_filters as filters

from uccaApp.models import Tasks


class TasksFilter(filters.FilterSet):
    id = filters.NumberFilter(name='id', lookup_type='exact')
    parent_task = filters.NumberFilter(name='parent_task', lookup_type='exact')
    type = filters.CharFilter(name='type', lookup_type='contains')
    status = filters.CharFilter(name='status', lookup_type='contains')
    manager_comment = filters.CharFilter(name='manager_comment', lookup_type='contains')
    is_demo = filters.BooleanFilter(name='is_demo', lookup_type='exact')
    is_active = filters.BooleanFilter(name='is_active', lookup_type='exact')
    created_by = filters.NumberFilter(name='created_by', lookup_type='exact')

    project = filters.NumberFilter(name='project', lookup_type='exact')
    passage = filters.NumberFilter(name='passage', lookup_type='exact')
    annotator = filters.NumberFilter(name='annotator', lookup_type='exact')

    class Meta:
        model = Tasks
        fields = {
            'id',
            'parent_task',
            'type',
            'status',
            'project',
            'passage',
            'annotator',
            'manager_comment',
            'is_demo',
            'created_by',
            'is_active',
        }
        # TODO: 
        # project
        # passage
        # annotator
