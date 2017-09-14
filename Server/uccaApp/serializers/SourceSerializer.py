from uccaApp.models.Sources import *
from rest_framework import serializers

from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify


class SourceSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Sources
        fields = ('id','name')


class SourceSerializer(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    class Meta:
        model = Sources
        fields = (
            'id',
            'name',
            'text',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser
        return Sources.objects.create(**validated_data)