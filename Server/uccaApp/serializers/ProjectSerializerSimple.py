
from uccaApp.models.Projects import *
from rest_framework import serializers

class ProjectSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = ('id','name')


