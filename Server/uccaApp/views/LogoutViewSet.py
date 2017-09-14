from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import (
    logout as django_logout
)

from uccaApp.models import LogLogin


class LogoutView(APIView):
    """
    Calls Django logout method and delete the Token object
    assigned to the current User object.

    Accepts/Returns nothing.
    """
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        if getattr(settings, 'ACCOUNT_LOGOUT_ON_GET', False):
            response = self.logout(request)
        else:
            response = self.http_method_not_allowed(request, *args, **kwargs)

        return self.finalize_response(request, response, *args, **kwargs)

    def post(self, request):
        return self.logout(request)

    def logout(self, request):
        try:

            LogLogin(
                login=request.user.first_name,
                user_id=request.user,
                action="logout",
                data='ip: ' + LogLogin.get_client_ip(request) + '; browser: ' + request.META['HTTP_USER_AGENT'],
                comment=""
            ).save()

            request.user.auth_token.delete()
        except (AttributeError, ObjectDoesNotExist):
            pass

        django_logout(request)

        return Response({"detail": ("Successfully logged out.")},status=status.HTTP_200_OK)