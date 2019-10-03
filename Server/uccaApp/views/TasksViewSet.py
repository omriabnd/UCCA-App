from django.db.models import PROTECT
from django.db.models import Q, F, Value
from django.db.models import ProtectedError
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import (
    PermissionDenied,
    NotFound
)

from uccaApp.models import Constants
from uccaApp.util.exceptions import DependencyFailedException
from uccaApp.util.functions import has_permissions_to
from uccaApp.filters.tasks_filter import TasksFilter
from uccaApp.serializers import TaskInChartSerializer

from uccaApp.serializers import TaskSerializer
from uccaApp.models.Tasks import Tasks

class TasksViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Tasks.objects.all().order_by('-out_of_date','-updated_at')
    # queryset = (Tasks.objects.all().filter(Q(parent_obseleted_by__isnull=False) |
    # Q(obseleted_by__isnull=False)).order_by('-updated_at') | Tasks.objects.all().order_by('-updated_at')).distinct()
        
    serializer_class = TaskInChartSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    filter_class = TasksFilter

    def get_queryset(self):
        if has_permissions_to(self.request, 'view_tasks'):
            # init
            param_user_tasks = None

            # get user_role
            user_role = self.request.user.groups.first().name

            # get all users tasks by user_id
            if  user_role == 'ADMIN':
                param_user_tasks = Tasks.objects.all().order_by('-out_of_date','-updated_at')
            elif user_role == 'PM' or user_role == 'PROJECT_MANAGER':
                param_user_tasks = Tasks.objects.all().filter(created_by=self.request.user.id).order_by('-out_of_date','-updated_at')
            elif user_role == 'ANNOTATOR' or user_role == 'GUEST':
                # if the current user wants to see his own tasks
                # changed by Omri 23.7.17 to include demo tasks
                param_user_tasks = (Tasks.objects.all().filter(is_demo=True, is_active=True,status=Constants.TASK_STATUS_JSON['SUBMITTED']) | Tasks.objects.all().filter(annotator=self.request.user.id, is_active=True)).order_by('-out_of_date','status','-updated_at').distinct()

            return param_user_tasks
        else:
            raise PermissionDenied

    def create(self, request, *args, **kwargs):
        raise NotFound


    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'add_tasks'):
            ownerUser = self.request.user
            request.data['created_by'] = ownerUser
            request.data['status'] =  Constants.TASK_STATUS_JSON['NOT_STARTED']
            return super(self.__class__, self).create(request)
        else:
            raise PermissionDenied


    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'delete_tasks'):
            try:
                return super(self.__class__, self).destroy(request)
            except ProtectedError:
                raise DependencyFailedException
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'change_tasks'):
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied
