from uccaApp.models.Categories import *
from rest_framework import serializers

from uccaApp.serializers.UsersSerializer import UsersSerializer_Simplify, DjangoUserSerializer_Simplify


class CategorySerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ('id','name')



class CategorySerializer(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    class Meta:

        model = Categories
        fields = (
            'id',
            'name',
            'description',
            'abbreviation',
            'tooltip',
            'is_default',
            'is_metacategory',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser
        return Categories.objects.create(**validated_data)
