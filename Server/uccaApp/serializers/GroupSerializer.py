# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.contrib.auth.models import Group
from rest_framework import serializers



class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id','url', 'name')
