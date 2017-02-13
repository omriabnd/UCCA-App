from django.db.models import PROTECT
from django.db.models import ProtectedError
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import (
    PermissionDenied,
    NotFound
)
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
    queryset = Tasks.objects.all()
    serializer_class = TaskInChartSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    filter_class = TasksFilter

    def get_queryset(self):
        if has_permissions_to(self.request.user.id, 'view_tasks'):
            # init
            param_user_tasks = None

            # get user_role
            user_role = self.request.user.groups.first().name

            # get all users tasks by user_id
            if  user_role == 'ADMIN':
                param_user_tasks = Tasks.objects.all()
            elif user_role == 'PM' or user_role == 'PROJECT_MANAGER':
                param_user_tasks = Tasks.objects.all().filter(created_by=self.request.user.id)
            elif user_role == 'ANNOTATOR' or user_role == 'GUEST':
                # if the current user wants to see his own tasks
                param_user_tasks = Tasks.objects.all().filter(annotator=self.request.user.id, is_active=True)

            return param_user_tasks
        else:
            raise PermissionDenied

    def create(self, request, *args, **kwargs):
        raise NotFound


    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'add_tasks'):
            ownerUser = self.request.user
            request.data['created_by'] = ownerUser
            return super(self.__class__, self).create(request)
        else:
            raise PermissionDenied


    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'delete_tasks'):
            try:
                return super(self.__class__, self).destroy(request)
            except ProtectedError:
                raise DependencyFailedException
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'change_tasks'):
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied
