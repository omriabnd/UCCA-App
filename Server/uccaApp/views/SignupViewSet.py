from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets

from uccaApp.util.functions import Send_Email, send_signup_email
from uccaApp.util.permissions import IsPostMethod
from uccaApp.models import Constants, Roles, LogLogin
from uccaApp.models import Users
from uccaApp.serializers.UsersSerializer import UsersSerializer
from rest_framework.response import Response



class SignupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Users.objects.all()
    serializer_class = UsersSerializer
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    permission_classes = [IsPostMethod]

    class Meta:
      model = Users




    def create(self, request, *args, **kwargs):
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

        send_signup_email(djangoUser.email,random_password)

        newUser = Users()
        newUser.id = djangoUser.pk
        newUser.user_auth = djangoUser
        newUser.first_name = request.data['first_name']
        newUser.last_name = request.data['last_name']
        newUser.email = request.data['email']
        newUser.organization = request.data['organization']
        newUser.affiliation = request.data['affiliation']
        newUser.role = Roles.objects.get(id=4)
        newUser.set_group(newUser.id, newUser.role.name)
        # newUser.created_by = ownerUser
        newUser.save()

        userSerialiser = UsersSerializer(newUser,context=context)
        res = {
          "result": userSerialiser.data
        }

        LogLogin(
            login=djangoUser.first_name,
            user_id=djangoUser,
            action="signup",
            data='ip: ' + LogLogin.get_client_ip(request) + '; browser: ' + request.META[
                'HTTP_USER_AGENT'] + '; response: ' + str(res),
            comment=""
        ).save()

        return Response(res)

