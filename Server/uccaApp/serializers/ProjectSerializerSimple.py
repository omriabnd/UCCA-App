# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.


from uccaApp.models.Projects import *
from rest_framework import serializers

class ProjectSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = ('id','name')


