# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.db.models import Count
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from uccaApp.util.functions import has_permissions_to
from uccaApp.models import Tasks
from uccaApp.serializers import TaskInChartSerializer



class UsersTasksViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = []
    queryset = Tasks.objects.all()
    serializer_class = TaskInChartSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)


    class Meta:
      model = Tasks


    def get_queryset(self):
        if has_permissions_to(self.request.user.id,'view_tasks'):
            # init
            param_user_tasks = None

            # get user_role
            user_role = self.request.user.groups.first().name

            # get all users tasks by user_id
            if self.request.user.is_superuser or user_role == 'ADMIN':
                param_user_tasks = Tasks.objects.all().filter(annotator=self.kwargs['user_id'])
            elif user_role == 'PM' or user_role =='PROJECT_MANAGER':
                param_user_tasks = Tasks.objects.all().filter(annotator=self.kwargs['user_id'],created_by=self.request.user.id)
            elif user_role == 'ANNOTATOR' or user_role =='GUEST':
                # if the current user wants to see his own tasks
                if self.kwargs['user_id'] == self.request.user.id:
                    param_user_tasks = Tasks.objects.all().filter(annotator=self.kwargs['user_id'],is_active=True)

            return param_user_tasks

        else:
            raise PermissionDenied
