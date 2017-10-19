
from django.db.models import Count
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from uccaApp.util.exceptions import SaveTypeDeniedException
from uccaApp.util.functions import has_permissions_to
from uccaApp.models import Tasks, Constants
from uccaApp.serializers import TaskSerializerAnnotator


class AnnotatorTasksViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = []
    queryset = Tasks.objects.all()
    serializer_class = TaskSerializerAnnotator
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
        
    class Meta:
      model = Tasks

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.context = {}

    def get_queryset(self):
        if has_permissions_to(self.request,'view_tasks'):
            return self.queryset
        else:
            raise PermissionDenied

    def update(self, request, *args, **kwargs):
        if(kwargs['save_type'] not in Constants.SAVE_TYPES):
            raise SaveTypeDeniedException
        if has_permissions_to(self.request, 'change_tasks'):
            self.context = dict(kwargs)
            #self.context['status'] = 'ONGOING'
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied

    def get_serializer_context(self):
        return self.context
    
