# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from uccaApp.models.Tasks import *
from rest_framework import serializers

from uccaApp.serializers.ProjectSerializerSimple import ProjectSerializer_Simplify
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify


class TaskSerializer_Simplify(serializers.ModelSerializer):
    user = DjangoUserSerializer_Simplify(many=False, read_only=True)
    project = ProjectSerializer_Simplify(many=False, read_only=True)

    # def get_project(self, obj):
    #   return obj.id + " TODO change into project simple_serializer"

    class Meta:
        model = Tasks
        fields = (
            'id',
            'type',
            'user',
            'project'
        )

