# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from uccaApp.models.Categories import *
from rest_framework import serializers

from uccaApp.models.Derived_Layers_Categories_Categories import Derived_Layers_Categories_Categories

class DerivedLayersCategoriesSerializer(serializers.ModelSerializer):

    parent_category_id = serializers.PrimaryKeyRelatedField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Derived_Layers_Categories_Categories
        fields = ('parent_category_id','category_id')


