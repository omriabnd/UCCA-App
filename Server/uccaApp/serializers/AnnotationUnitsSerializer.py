from rest_framework import serializers

from uccaApp.models import Annotation_Remote_Units_Annotation_Units
from uccaApp.models import Annotation_Units_Categories
from uccaApp.models import Annotation_Units_Tokens
from uccaApp.models.Annotation_Units import Annotation_Units
from uccaApp.models.Categories import Categories
from uccaApp.serializers import CategorySerializer_Simplify
from uccaApp.serializers.TokenSerializer import TokensSerializer_Simplify, TokensSerializer
from uccaApp.serializers.TaskSerializerSimple import TaskSerializer_Simplify


class Annotation_UnitsSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Annotation_Units
        fields = ('id')


class Annotation_UnitsSerializer(serializers.ModelSerializer):
    # id = serializers.ReadOnlyField
    task_id = serializers.ReadOnlyField
    is_remote_copy = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    children_tokens = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    parent_id = serializers.SerializerMethodField()

    def get_parent_id(self,obj):
        parent_unit = obj.parent_id
        if parent_unit is not None:
            return parent_unit.annotation_unit_tree_id
        return None

    def get_is_remote_copy(self, obj):
        if hasattr(obj, 'is_remote_copy'):
            return obj.is_remote_copy
        return False


    def get_categories(self, obj):
        categories_json = []

        if hasattr(obj, 'is_remote_copy') == False or obj.is_remote_copy == False:
            categories = Annotation_Units_Categories.objects.all().filter(unit_id=obj.id,remote_parent_id=None )
        else:
            categories = Annotation_Units_Categories.objects.all().filter(unit_id=obj.id, remote_parent_id=obj.parent_id)

        for cat in categories:
                categories_json.append(CategorySerializer_Simplify(cat.category_id).data)

        return categories_json

    def get_children_tokens(self, obj):
        tokens = Annotation_Units_Tokens.objects.all().filter(unit_id=obj.id)
        tokens_json = []
        for t in tokens:
            tokens_json.append(TokensSerializer_Simplify(t.token_id).data)
        return tokens_json

    def get_children(self, obj):
        children_annotation_units = Annotation_Units.objects.all().filter(parent_id=obj.id)
        children_json = []
        for cl in children_annotation_units:
            children_json.append(Annotation_UnitsSerializer(cl).data)
        return children_json


    class Meta:
        model = Annotation_Units
        fields = (
            'id',
            'annotation_unit_tree_id',
            'task_id',
            'type',
            'is_remote_copy',
            'comment',
            'categories',
            'children_tokens',
            'children',
            'parent_id',
            'gui_status'
        )
