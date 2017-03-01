# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from rest_framework.generics import get_object_or_404

from uccaApp.util.functions import active_obj_or_raise_exeption, get_value_or_none
from uccaApp.models import Tasks
from uccaApp.models.Projects import *
from rest_framework import serializers
from uccaApp.serializers.LayerSerializer import LayerSerializer_Simplify
from uccaApp.serializers.TaskSerializer import TaskSerializer_Simplify
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify

class ProjectSerializer(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    # layer = serializers.SerializerMethodField()
    layer = LayerSerializer_Simplify()
    tasks = serializers.SerializerMethodField()

    # def get_layer(self,obj):
    #     return LayerSerializer_Simplify(obj.layer_id).data

    def get_tasks(self,obj):
        children_tasks = Tasks.objects.all().filter(project_id=obj.id)
        children_json = []
        for cl in children_tasks:
            children_json.append(TaskSerializer_Simplify(cl).data)
        return children_json


    class Meta:
        model = Projects
        fields = (
            'id',
            'name',
            'description',
            'tooltip',
            'layer',
            'tasks',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser
        layer = get_object_or_404(Layers, pk=get_value_or_none('id', self.initial_data['layer']))
        active_obj_or_raise_exeption(layer)
        validated_data['layer'] = layer
        return Projects.objects.create(**validated_data)

    def update(self, instance, validated_data):

        if self.is_in_use_in_tasks(instance) == False:
            validated_data.pop('layer')
            updated_layer = get_object_or_404(Layers, pk=get_value_or_none('id', self.initial_data['layer']))
            active_obj_or_raise_exeption(updated_layer)
            instance.layer = validated_data.get('layer', updated_layer)

        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.tooltip = validated_data.get('description', instance.tooltip)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance

    def is_in_use_in_tasks(self,instance):
        tasks_list = Tasks.objects.all().filter(project_id=instance.id)
        is_in_use = len(tasks_list) > 0
        return is_in_use