# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

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

    def get_tokenization_task_id(self, obj):
        return obj.task_id_id

    class Meta:
        model = Tokens
        fields = (
            'id',
            'tokenization_task_id',
            'require_annotation',
            'text',
            'start_index',
            'end_index'
        )
