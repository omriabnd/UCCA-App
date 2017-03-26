import logging
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from rest_framework import parsers
from rest_framework import renderers
from rest_framework import viewsets
from rest_framework.views import APIView

from uccaApp.util.functions import Send_Email, send_forgot_password_email
from uccaApp.util.permissions import IsPostMethod
from uccaApp.models import Constants, Roles
from uccaApp.models import Users
from uccaApp.serializers.ForgotPasswordSerializer import ForgotPasswordSerializer
from uccaApp.serializers.UsersSerializer import UsersSerializer
from rest_framework.response import Response




class ForgotPasswordViewSet(APIView):

    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True) #raise_exception=True
        user = serializer.validated_data['user']

        random_password = User.objects.make_random_password()
        user.set_password(random_password)
        user.save()

        send_forgot_password_email(user.email, random_password)

        res = {
            "msg":"A message has been sent to you by email with your password"
        }
        return Response(res)


    def handle_exception(self, exception):

        # Log the error.
        logging.exception(exception)

        # Set a custom message.
        res = {
            "error": exception.args[0]
        }


        # If the exception is a HTTPException, use its error code.
        # Otherwise use a generic 500 error code.

        # raise APIException("There was a problem!")

        return Response(res,status=200)
