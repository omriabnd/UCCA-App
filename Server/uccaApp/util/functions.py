# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.contrib.auth.models import User
from rest_framework.generics import get_object_or_404

from uccaApp.util.exceptions import InActiveModelExeption


def Send_Email(email, password):
    print("email: "+email+" ,password: "+password)

def get_value_or_none(key,dict):
    if dict is None or key is None:
        return None
    if key in dict:
        return dict[key]
    else:
        return None;

def active_obj_or_raise_exeption(obj):
    if obj is not None and obj.is_active == False:
        raise InActiveModelExeption

def has_permissions_to(user_id,premission_code_name):
    user = get_object_or_404(User, pk=user_id)

    if (user.groups.first()):
        group = user.groups.first().name
        has_perm = user.has_perm('uccaApp.' + premission_code_name)
    else:
        group = 'NULL'
        has_perm = False

    print(user.email + '('+ group +')' + ' has permissions to '+premission_code_name,has_perm)
    return has_perm
