from uccaApp.models.Roles import *
from rest_framework import serializers

class RolesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Roles
        fields = ('id','name')

