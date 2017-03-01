# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.contrib.auth.models import User
from rest_framework import serializers
from uccaApp.models.Users import *
from uccaApp.serializers.RolesSerializer import RolesSerializer


class DjangoUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)

    def get_name(self, obj):
        return obj.first_name + ' ' + obj.last_name

    class Meta:
        model = User
        fields = ('id','username','first_name','last_name','name','email','is_staff','groups','is_active','date_joined')

class DjangoUserSerializer_Simplify(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)

    def get_name(self, obj):
        return obj.first_name + ' ' + obj.last_name

    class Meta:
        model = User
        fields = ("id","first_name","last_name",'name')


class UsersSerializer_Simplify(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    def get_name(self,obj):
        return obj.first_name + ' ' + obj.last_name

    class Meta:
        model = Users
        fields = ("id","first_name","last_name",'name')


class UsersSerializer(serializers.ModelSerializer):
    # user_auth = DjangoUserSerializer(many=False)
    created_by = DjangoUserSerializer_Simplify(many=False,read_only=True)
    role = RolesSerializer(many=False)
    name = serializers.SerializerMethodField(read_only=True)

    def get_name(self, obj):
        return obj.first_name + ' ' + obj.last_name

    class Meta:
        model = Users
        fields = (
            "id", "first_name", "last_name",'name', "email", "organization", "affiliation", "role", "created_by","is_active", "created_at", "updated_at"
        )
        read_only_fields = ('created_at', 'updated_at','created_by',)


    def update(self, instance, validated_data):
        role_data = validated_data.pop('role')
        new_role = Roles.objects.get(id=self.initial_data['role']['id'])
        instance.role = validated_data.get('role', new_role)
        instance.set_group(instance.pk, role_data['name'])

        instance.first_name = validated_data.get('first_name',instance.first_name)
        instance.last_name = validated_data.get('last_name',instance.last_name)
        instance.organization = validated_data.get('organization',instance.organization)
        instance.affiliation = validated_data.get('affiliation',instance.affiliation)
        instance.is_active = validated_data.get('is_active',instance.is_active)
        instance.save()
        return instance
