import logging
from http.client import HTTPException

from django.template.defaulttags import csrf_token
from rest_framework import parsers, renderers
from rest_framework import response
from rest_framework.authtoken.models import Token
# from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.response import Response
from rest_framework.views import APIView, exception_handler
from django.contrib.auth import authenticate, login

from uccaApp.util.exceptions import InActiveUserLoginExeption
from uccaApp.models.Users import Users
from uccaApp.serializers import UsersSerializer
from uccaApp.serializers.AuthTokenSerializer import *
# from rest_framework.exceptions import APIException

csrf_token
class ObtainAuthToken(APIView):
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = AuthTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True) #raise_exception=True
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        profile = Users.objects.get(id=user.id)
        if profile.is_active == False:
            raise InActiveUserLoginExeption

        res = {
            'token': token.key,
            "profile": UsersSerializer(profile).data
        }
        return Response(res)
