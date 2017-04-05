from django.db.models import PROTECT
from django.db.models import ProtectedError
from rest_framework import filters
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from uccaApp.util.exceptions import DependencyFailedException
from uccaApp.util.functions import has_permissions_to
from uccaApp.filters.sources_filter import SourcesFilter
from uccaApp.serializers import SourceSerializer
from uccaApp.models.Sources import Sources

class SourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Sources.objects.all().order_by('-updated_at')
    serializer_class = SourceSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    filter_class = SourcesFilter
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('id','updated_at')
    ordering = ('-updated_at','id',)

    def get_queryset(self):
        if has_permissions_to(self.request.user.id, 'view_sources'):
            return self.queryset
        else:
            raise PermissionDenied

    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'add_sources'):
            ownerUser = self.request.user
            request.data['created_by'] = ownerUser
            request.data.pop('created_at')
            return super(self.__class__, self).create(request)
        else:
            raise PermissionDenied

    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'delete_sources'):
            try:
                return super(self.__class__, self).destroy(request)
            except ProtectedError:
                raise DependencyFailedException
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'change_sources'):
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied
