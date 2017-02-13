from rest_framework.permissions import BasePermission

from uccaApp.models import Users


class IsPostMethod(BasePermission):
    message = "you should use a post method."
    my_safe_methods = ['POST']

    def has_permission(self, request, view):
        if request.method in self.my_safe_methods:
            return True
        return False

class IsAdmin(BasePermission):
    message = "this call is autorized for Admin role only."

    def has_permission(self, request, view):
        currentUser = Users.objects.get(id=request.user.id)
        if currentUser == 1:
            return True
        return False

