from django.db.models import ProtectedError
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework_filters.backends import DjangoFilterBackend

from uccaApp.util.exceptions import DependencyFailedException
from uccaApp.util.functions import has_permissions_to
from uccaApp.filters.categories_filter import CategoriesFilter
from uccaApp.models import Categories
from uccaApp.serializers.CategorySerializer import CategorySerializer



class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    filter_backends = (DjangoFilterBackend,)
    search_fields = ['name','tooltip','abbreviation',]
    # filter_fields = {'id','name','description','tooltip','is_default','abbreviation','created_by','is_active'}
    filter_class = CategoriesFilter


    def get_queryset(self):
        if has_permissions_to(self.request.user.id, 'view_categories'):
            return self.queryset
        else:
            raise PermissionDenied

    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'add_categories'):
            ownerUser = self.request.user
            request.data['created_by'] = ownerUser
            request.data.pop('created_at')
            return super(self.__class__, self).create(request)
        else:
            raise PermissionDenied

    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'delete_categories'):
            try:
                return super(self.__class__, self).destroy(request)
            except ProtectedError:
                raise DependencyFailedException
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request.user.id, 'change_categories'):
            return super(self.__class__, self).update(request)
        else:
            raise PermissionDenied
