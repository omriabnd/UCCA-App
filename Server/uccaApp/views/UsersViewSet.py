from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_filters.backends import DjangoFilterBackend

from uccaApp.util.functions import Send_Email, has_permissions_to, send_invite_email
from uccaApp.filters.users_filter import UsersFilter
from uccaApp.models import Constants, Roles
from uccaApp.models import Users
from uccaApp.serializers.UsersSerializer import UsersSerializer
from rest_framework.response import Response
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer


class DjangoUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    # permission_classes = [IsAuthenticated,]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = DjangoUserSerializer

class UsersViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = [IsAuthenticated]
    queryset = Users.objects.all().order_by('-updated_at')
    serializer_class = UsersSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    filter_backends = (DjangoFilterBackend,)
    filter_class = UsersFilter

    class Meta:
      model = Users


    def get_queryset(self):
        if has_permissions_to(self.request,'view_users'):

            param_user_details = None

            # get user_role
            user_role = self.request.user.groups.first().name
            if  user_role == 'GUEST':
                param_user_details = Users.objects.all().order_by('-updated_at')
                # if the current user wants to see his own tasks
                param_user_details = Users.objects.all().filter(id=self.request.user.id, is_active=True)
            else:
                param_user_details = Users.objects.all().order_by('-updated_at')

            return param_user_details
        else:
            raise PermissionDenied


    def create(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'add_users'):
            context = {
                'request': self.request
            }

            ownerUser = request.user

            djangoUser = User()
            djangoUser.email = request.data['email']
            djangoUser.first_name = request.data['first_name']
            djangoUser.last_name = request.data['last_name']
            djangoUser.username = request.data['first_name'] + get_random_string(length=8)

            random_password = User.objects.make_random_password()

            djangoUser.set_password(random_password)

            Users.validate_email_unique(djangoUser.email)

            djangoUser.save()

            send_invite_email(inviterName=self.request.user.first_name, toEmail=djangoUser.email, password=random_password)

            newUser = Users()
            newUser.id = djangoUser.pk
            newUser.user_auth = djangoUser
            newUser.first_name = request.data['first_name']
            newUser.last_name = request.data['last_name']
            newUser.email = request.data['email']
            newUser.organization = request.data['organization']
            newUser.affiliation = request.data['affiliation']
            newUser.role = Roles.objects.get(id=request.data['role']['id'])
            newUser.set_group(newUser.id, newUser.role.name)
            newUser.created_by = ownerUser
            newUser.save()

            userSerialiser = UsersSerializer(newUser,context=context)
            res = {
              "result": userSerialiser.data
            }
            return Response(res)
        else:
            raise PermissionDenied


    def update(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'change_users'):
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            new_role = Roles.objects.get(id=request.data['role']['id'])
            request.data['role'] = {
                'id': new_role.id,
                'name': new_role.name
            }
            # Roles.objects.get(id=request.data['role']['value'])
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # refresh the instance from the database.
                instance = self.get_object()
                serializer = self.get_serializer(instance)

            return Response(serializer.data)
        else:
            raise PermissionDenied


    def destroy(self, request, *args, **kwargs):
        if has_permissions_to(self.request, 'delete_users'):
            instance = self.get_object()
            User.objects.get(pk=instance.id).delete()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            raise PermissionDenied
