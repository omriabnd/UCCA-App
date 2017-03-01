# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.db.models import Count
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from uccaApp.util.functions import has_permissions_to
from uccaApp.models import Projects
from uccaApp.models import Tasks
from uccaApp.serializers import ProjectSerializer



class UsersProjectsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = []
    queryset = Projects.objects.all()
    serializer_class = ProjectSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)


    class Meta:
      model = Projects


    def get_queryset(self):
        if has_permissions_to(self.request.user.id,'view_projects'):
            # init
            param_user_tasks = None
            projects_set = []

            # get user_role
            user_role = self.request.user.groups.first().name

            # get all users tasks by user_id
            if self.request.user.is_superuser or user_role == 'ADMIN':
                param_user_tasks = Tasks.objects.values('project_id','annotator_id','created_by').filter(
                    annotator=self.kwargs['user_id'])
            elif user_role == 'PM' or user_role =='PROJECT_MANAGER':
                param_user_tasks = Tasks.objects.values('project_id', 'annotator_id', 'created_by').filter(
                    annotator=self.kwargs['user_id'],created_by=self.request.user.id)

            if param_user_tasks is not None:
                #  group by project_id
                user_tasks = param_user_tasks.annotate(Count('project_id'))

                for ut in user_tasks:
                    projects_set.append(Projects.objects.get(pk=ut['project_id']))

            return projects_set

        else:
            raise PermissionDenied
