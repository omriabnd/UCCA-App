from uccaApp.models.Categories import *
from rest_framework import serializers

from uccaApp.models.Layers_Categories import Layers_Categories
from uccaApp.serializers.CategorySerializer import CategorySerializer_Simplify
from uccaApp.serializers.UsersSerializer import UsersSerializer_Simplify, DjangoUserSerializer_Simplify


class LayersCategoriesSerializer(serializers.ModelSerializer):
    parent = CategorySerializer_Simplify(read_only=True)
    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    abbreviation = serializers.SerializerMethodField()
    tooltip = serializers.SerializerMethodField()
    is_metacategory = serializers.SerializerMethodField()

    def get_id(self,obj):
        return obj.category_id_id

    def get_name(self,obj):
        return obj.category_id.name

    def get_description(self,obj):
        return obj.category_id.description

    def get_abbreviation(self,obj):
        return obj.category_id.abbreviation

    def get_tooltip(self,obj):
        return obj.category_id.tooltip

    def get_is_metacategory(self,obj):
        return obj.category_id.is_metacategory

    class Meta:
        model = Layers_Categories
        fields = ('id','name','shortcut_key','was_default','parent','description','abbreviation','tooltip','is_metacategory')


