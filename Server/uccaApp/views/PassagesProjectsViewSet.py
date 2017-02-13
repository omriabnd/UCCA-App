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



class PassagesProjectsViewSet(viewsets.ModelViewSet):
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
            param_passage_tasks = None
            projects_set = []

            # get user_role
            user_role = self.request.user.groups.first().name

            # get all tasks by passage id
            if self.request.user.is_superuser or user_role == 'ADMIN':
                param_passage_tasks = Tasks.objects.values('project_id','passage_id','created_by').filter(
                    passage=self.kwargs['passage_id'])
            elif user_role == 'PM' or user_role =='PROJECT_MANAGER':
                param_passage_tasks = Tasks.objects.values('project_id', 'passage_id', 'created_by').filter(
                    passage=self.kwargs['passage_id'],created_by=self.request.user.id)

            if param_passage_tasks is not None:
                #  group by project_id
                passage_tasks = param_passage_tasks.annotate(Count('project_id'))

                for pt in passage_tasks:
                    projects_set.append(Projects.objects.get(pk=pt['project_id']))

            return projects_set

        else:
            raise PermissionDenied


    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)