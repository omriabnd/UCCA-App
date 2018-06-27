from uccaApp.models.Tokens import *
from rest_framework import serializers


class TokensSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Tokens
        fields = (
            'id',
        )


class TokensSerializer(serializers.ModelSerializer):
    tokenization_task_id = serializers.SerializerMethodField()
    index_in_task = serializers.SerializerMethodField()

    def get_tokenization_task_id(self, obj):
        return obj.task_id_id

    def get_index_in_task(self, obj):
        return self.context['index_in_task']

    class Meta:
        model = Tokens
        fields = (
            'id',
            'tokenization_task_id',
            'index_in_task',
            'require_annotation',
            'text',
            'start_index',
            'end_index'
        )
