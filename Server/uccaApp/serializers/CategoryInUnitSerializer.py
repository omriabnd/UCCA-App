import pdb
from rest_framework import serializers
from uccaApp.models.Annotation_Units_Categories import Annotation_Units_Categories


class CategoryInUnitSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    
    def get_id(self,obj):
        return obj.category_id.id

    class Meta:
        model = Annotation_Units_Categories
        fields = ('id','slot')
    

