# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from uccaApp.models.Roles import *
from rest_framework import serializers

class RolesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Roles
        fields = ('id','name')

