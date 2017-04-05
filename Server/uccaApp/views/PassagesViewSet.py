from django.db.models import ProtectedError
from django.db.models import Q
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework_filters.backends import DjangoFilterBackend

from uccaApp.util.exceptions import DependencyFailedException
from uccaApp.util.functions import has_permissions_to
from uccaApp.filters.passages_filter import PassagesFilter
from uccaApp.models.Sources import Sources

from uccaApp.serializers import PassageSerializer
from uccaApp.serializers import SourceSerializer
from uccaApp.models.Passages import Passages
from uccaApp.serializers.PassageSerializer import PassageSerializer_Simplify


class PassagesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Passages.objects.all().order_by('-updated_at')
    serializer_class = PassageSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    # search_fields = ['id','source','type','text','is_active',]
    filter_backends = (DjangoFilterBackend,)
    filter_class = PassagesFilter



    def get_queryset(self):
        if has_permissions_to(self.request.user.id, 'view_passages'):
            return self.queryset
        else:
            raise PermissionDenied

    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'add_passages'):
            ownerUser = self.request.user
            request.data['created_by'] = ownerUser

            return super(self.__class__, self).create(request)
        else:
            raise PermissionDenied

    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'delete_passages'):
            try:
                return super(self.__class__, self).destroy(request)
            except ProtectedError:
                raise DependencyFailedException
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'change_passages'):
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied
