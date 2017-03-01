# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.


from uccaApp.models.Projects import *
from rest_framework import serializers

from uccaApp.serializers import LayerSerializer


class ProjectSerializerForAnnotator(serializers.ModelSerializer):
    layer = LayerSerializer()
    class Meta:
        model = Projects
        fields = (
          'id',
          'name',
          'description',
          'layer',
        )


