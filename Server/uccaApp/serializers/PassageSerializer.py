from rest_framework.generics import get_object_or_404

from uccaApp.models import Tasks
from uccaApp.util.functions import get_value_or_none, active_obj_or_raise_exeption
from uccaApp.models.Passages import *
from rest_framework import serializers

from uccaApp.serializers.SourceSerializer import SourceSerializer_Simplify
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify


class PassageSerializer_Simplify(serializers.ModelSerializer):
    short_text = serializers.SerializerMethodField('make_short_text')

    def make_short_text(self, obj):
        return obj.text[:30]+"..."

    class Meta:
        model = Passages
        fields = ('id','type','short_text')




class PassageSerializer(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    source = SourceSerializer_Simplify(many=False)
    class Meta:
        model = Passages
        fields = (
            'id',
            'text',
            'type',
            'source',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser

        source = get_object_or_404(Sources, pk= get_value_or_none('id',self.initial_data['source']) )

        active_obj_or_raise_exeption(source)
        validated_data['source'] = source

        texts_array = validated_data['text'].split("<DELIMITER>")

        for text in texts_array:
          validated_data['text'] = text
          newPassage = Passages.objects.create(**validated_data)

        return newPassage

    def update(self, instance, validated_data):
        validated_data.pop('source')

        # prevent update asset that used in another asset
        if self.is_used_in_a_task(instance) == False:
            updated_source = get_object_or_404(Sources, pk=get_value_or_none('id', self.initial_data['source']))
            instance.source = validated_data.get('source', updated_source)
            instance.text = validated_data.get('text', instance.text)

        instance.type = validated_data.get('type', instance.type)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance

    def is_used_in_a_task(self,instance):
        children_list = Tasks.objects.all().filter(passage=instance.id)
        is_parent = len(children_list) > 0
        return is_parent