import json, pdb

from django.contrib.auth.models import User
from django.utils.safestring import mark_safe
from rest_framework.generics import get_object_or_404

from uccaApp.util.exceptions import CreateDerivedLayerException
from uccaApp.util.functions import get_value_or_none, active_obj_or_raise_exeption
from uccaApp.models import Constants
from uccaApp.models import Layers
from rest_framework import serializers

from uccaApp.models import Layers_Categories_Restrictions
from uccaApp.models import Projects
from uccaApp.models.Categories import Categories
from uccaApp.models.Derived_Layers_Categories_Categories import Derived_Layers_Categories_Categories
from uccaApp.models.Layers_Categories import Layers_Categories
from uccaApp.serializers import DjangoUserSerializer_Simplify
from uccaApp.serializers.LayersCategoriesRestrictions import LayersCategoriesResrictionsSerializer
from uccaApp.serializers.LayersCategoriesSerializer import LayersCategoriesSerializer
from uccaApp.serializers.ProjectSerializerSimple import ProjectSerializer_Simplify


class LayerSerializer_Simplify(serializers.ModelSerializer):
    class Meta:
        model = Layers
        fields = ('id', 'name','type')


class LayerSerializer(serializers.ModelSerializer):

    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    categories = serializers.SerializerMethodField(read_only=True)
    parent = serializers.SerializerMethodField(read_only=True)

    children = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()
    restrictions = serializers.SerializerMethodField()

    def get_restrictions(self,obj):
        layer_restrictions_json = []
        # Omri Abend commented out Sep 13
        #if obj.type == Constants.LAYER_TYPES_JSON['ROOT'] or obj.type == Constants.LAYER_TYPES_JSON['EXTENSION'] :
        layer_restrictions = Layers_Categories_Restrictions.objects.all().filter(layer_id=obj.id)
        for lr in layer_restrictions:
            layer_restrictions_json.append(LayersCategoriesResrictionsSerializer(lr).data)

        return layer_restrictions_json

    def get_parent(self, obj):
        if obj.parent_layer_id_id is not None:
            return (LayerSerializer(obj.parent_layer_id).data)
        else:
            return None

    def get_categories(self, obj):
        lc_json = []
        if obj.type ==  Constants.LAYER_TYPES_JSON["ROOT"] or obj.type ==  Constants.LAYER_TYPES_JSON["EXTENSION"]:
            lc_list = Layers_Categories.objects.all().filter(layer_id=obj.id)
        if obj.type ==  Constants.LAYER_TYPES_JSON["REFINEMENT"] or obj.type ==  Constants.LAYER_TYPES_JSON["COARSENING"]:
            lc_list = []
            dlcc_list = Derived_Layers_Categories_Categories.objects.all().filter(layer_id=obj.id)
            dlcc_lc_list = Layers_Categories.objects.all().filter(layer_id=obj.id)
            for lc in dlcc_list:
                cat = Layers_Categories()
                cat.id = lc.category_id.id
                cat.category_id = lc.category_id
                cat.parent = lc.parent_category_id
                try:
                    lc_obj = Layers_Categories.objects.get(layer_id=obj.id,category_id=lc.category_id.id)
                    cat.was_default = lc_obj.was_default
                    cat.shortcut_key = lc_obj.shortcut_key
                    lc_list.append(cat)
                except:
                    lc_obj = None

        for lc in lc_list:
            lc_json.append(LayersCategoriesSerializer(lc).data)

        return lc_json

    def get_children(self, obj):
        children_layers = Layers.objects.all().filter(parent_layer_id=obj.id)
        children_json = []
        for cl in children_layers:
            children_json.append(LayerSerializer_Simplify(cl).data)

        return children_json

    def get_projects(self, obj):
        layer_projects = Projects.objects.all().filter(layer=obj.id)
        layer_projects_json = []
        for lp in layer_projects:
            layer_projects_json.append(ProjectSerializer_Simplify(lp).data)
        return layer_projects_json


    class Meta:
        model = Layers
        fields = (
            "id",
            "name",
            "description",
            "type",
            "tooltip",
            "parent",
            "children",
            "projects",
            "categories",
            "restrictions",
            "is_active",
            "created_by",
            "created_at",
            "updated_at",
            "slotted"             # added Omri, Sep 12
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser
        categories = validated_data['categories'] = self.initial_data['categories']
        restrictions = validated_data['restrictions'] = self.initial_data['restrictions']

        layer_type = validated_data['type']
        
        if layer_type ==  Constants.LAYER_TYPES_JSON['ROOT']:
            newLayer = self.save_layer(validated_data)
            self.save_layer_categories(newLayer,categories)
            self.save_root_restrictions(newLayer,restrictions)
        else:
            validated_data['parent'] = self.initial_data['parent']
            newLayer = self.save_derived_layer(validated_data)
            if newLayer is not None:
                if newLayer.type ==  Constants.LAYER_TYPES_JSON['EXTENSION']:
                    self.save_layer_categories(newLayer, categories)
                elif newLayer.type ==  Constants.LAYER_TYPES_JSON['REFINEMENT']:
                    self.save_layer_categories(newLayer, categories)
                    self.save_derived_categories(newLayer, categories)
                elif newLayer.type == Constants.LAYER_TYPES_JSON['COARSENING']:
                    uniq_categories = self.group_by_category_id(categories)
                    self.save_layer_categories(newLayer, uniq_categories)
                    self.save_derived_categories(newLayer, categories)
                # Omri Abend, Sep 13
                self.save_derived_restrictions(newLayer)

        return newLayer

    def update(self, instance, validated_data):

        # avoid changing the layer's type
        validated_data['type'] = instance.type
        categories = validated_data['categories'] = self.initial_data.get('categories')
        restrictions = validated_data['restrictions'] = self.initial_data['restrictions']

        # disable changing non-metaadata attrs if is parent of other layers
        if self.is_parent_of_other_layer(instance) == False and self.already_in_use_in_a_project(instance) == False:
            # start update the connected tables [Layers_Categories , Layers_Categories_Restrictions]
            # update layer_categories - by reset

            # remove its current layer_categories
            Layers_Categories.objects.filter(layer_id=instance.id).delete()

            if instance.type == Constants.LAYER_TYPES_JSON['ROOT'] or instance.type == Constants.LAYER_TYPES_JSON['EXTENSION']:
                if categories is not None:
                    # insert the new layer)categories
                    self.save_layer_categories(instance, categories)
                # remove its current layer_restrictions
                Layers_Categories_Restrictions.objects.filter(layer_id=instance.id).delete()
                if restrictions is not None:
                    # update layer_categories_restrictions - by reset
                    self.save_root_restrictions(instance, restrictions)

            elif instance.type == Constants.LAYER_TYPES_JSON['REFINEMENT']:
                if categories is not None:
                    # insert the new layer)categories
                    self.save_layer_categories(instance, categories)
                # remove its current layer_categories
                Derived_Layers_Categories_Categories.objects.filter(layer_id=instance.id).delete()
                if categories is not None:
                    # insert the new layer)categories
                    self.save_derived_categories(instance, categories)
            elif instance.type == Constants.LAYER_TYPES_JSON['COARSENING']:
                uniq_categories = self.group_by_category_id(categories)
                if categories is not None:
                    # insert the new layer)categories
                    self.save_layer_categories(instance, uniq_categories)
                # remove its current layer_categories
                Derived_Layers_Categories_Categories.objects.filter(layer_id=instance.id).delete()
                if categories is not None:
                    # insert the new layer)categories
                    self.save_derived_categories(instance, categories)

        # continue updating the layer's attributes
        return super(self.__class__, self).update(instance, validated_data)

    def group_by_category_id(self,models_array):
        res = []
        for um in models_array:
            if any(o['id'] == um['id'] for o in res) != True:
                res.append(um)
        return res

    def already_in_use_in_a_project(self,instance):
        projects_list = instance.projects_set.all()
        already_in_use = len(projects_list ) > 0
        return already_in_use

    def is_parent_of_other_layer(self,instance):
        children_list = Layers.objects.all().filter(parent_layer_id=instance.id)
        is_parent = len(children_list) > 0
        return is_parent

    def save_layer(self,validated_data):
        newLayer = Layers()
        newLayer.created_by = self.initial_data['created_by']
        newLayer.name = validated_data['name']
        newLayer.type = validated_data['type']
        newLayer.description = validated_data['description']
        newLayer.tooltip = validated_data['tooltip']
        newLayer.slotted = validated_data['slotted']

        if self.initial_data['parent'] is not None and self.initial_data['parent'] and newLayer.type !=  Constants.LAYER_TYPES_JSON['ROOT']: # no parent for root layer
            if(newLayer.type == Constants.LAYER_TYPES_JSON['REFINEMENT'] or newLayer.type == Constants.LAYER_TYPES_JSON['COARSENING']):
                parent_id = self.initial_data['parent']['id']
            else:
                parent_id = self.initial_data['parent'][0]['id']
            newLayer.parent_layer_id = get_object_or_404(Layers,pk=parent_id) # TODO: check if '[0]' is ok

        newLayer.save()
        return newLayer

    def save_root_restrictions(self,newLayer,restrictions):
        for lr in restrictions:
            newLayerCategoriesRestriction = Layers_Categories_Restrictions()
            newLayerCategoriesRestriction.layer_id = newLayer
            newLayerCategoriesRestriction.resriction_type = lr['type']
            newLayerCategoriesRestriction.category_ids1 = lr['categories_1']
            newLayerCategoriesRestriction.category_ids2 = lr['categories_2']
            newLayerCategoriesRestriction.save()

    def save_layer_categories(self,newLayer,categories):
        for lc in categories:
            newLayerCategories = Layers_Categories()
            newLayerCategories.layer_id = newLayer
            theCategory = Categories.objects.get(pk=lc['id'])
            theCategory = get_object_or_404(Categories, pk=get_value_or_none('id', lc))
            active_obj_or_raise_exeption(theCategory)

            if theCategory is not None:
                newLayerCategories.category_id = theCategory
                newLayerCategories.was_default = theCategory.is_default
                newLayerCategories.shortcut_key = get_value_or_none('shortcut_key',lc)
                newLayerCategories.save()

    def save_derived_layer(self,validated_data):
        if validated_data['parent'] is not None:
            return self.save_layer(validated_data)
        else:
            raise CreateDerivedLayerException

    def is_category_exsists_in_parent_layer(self,category,layer):
        found_category = get_object_or_404(Layers_Categories,layer_id=layer.id,category_id=category.id)
        return found_category is not None

    def save_derived_restrictions(self,newLayer):
        # read restrictions from the parent layer and save them in the newLayer
        # Omri Abend, Sep 13
        parent_forbid_restrictions = Layers_Categories_Restrictions.objects.all().filter(layer_id=newLayer.parent_layer_id.id,resriction_type=Constants.RESTRICTION_TYPES_JSON['FORBID_ANY_CHILD'])

        for restriction in parent_forbid_restrictions:
            newLayerCategoriesRestriction = Layers_Categories_Restrictions()
            newLayerCategoriesRestriction.layer_id = newLayer
            newLayerCategoriesRestriction.resriction_type = restriction.resriction_type
            newLayerCategoriesRestriction.category_ids1 = restriction.category_ids1
            newLayerCategoriesRestriction.category_ids2 = restriction.category_ids2
            newLayerCategoriesRestriction.save()


    def save_derived_categories(self,newLayer,categories):
        if newLayer.type ==  Constants.LAYER_TYPES_JSON['REFINEMENT']:
            for dlcc in categories:
                # save the derived_layer_category_category
                newDerivedLayerCategories = Derived_Layers_Categories_Categories()
                newDerivedLayerCategories.layer_id = newLayer

                if dlcc['parent'] is not None and dlcc['parent']['id'] is not None:
                    parent_category = get_object_or_404(Categories, id=get_value_or_none('id', dlcc['parent']))
                    active_obj_or_raise_exeption(parent_category)

                if self.is_category_exsists_in_parent_layer(parent_category,newLayer.parent_layer_id):
                    newDerivedLayerCategories.parent_category_id = parent_category

                    child_category = get_object_or_404(Categories, id=get_value_or_none('id', dlcc))
                    active_obj_or_raise_exeption(child_category)

                    newDerivedLayerCategories.category_id = child_category
                    newDerivedLayerCategories.save()

        elif newLayer.type ==  Constants.LAYER_TYPES_JSON['COARSENING']:
            for dlcc in categories:
                # for parent_c_id in dlcc['parent_category']:
                    newDerivedLayerCategories = Derived_Layers_Categories_Categories()
                    newDerivedLayerCategories.layer_id = newLayer

                    if dlcc['parent'] is not None and dlcc['parent']['id'] is not None:
                        parent_category = get_object_or_404(Categories, id=dlcc['parent']['id'])

                    if self.is_category_exsists_in_parent_layer(parent_category, newLayer.parent_layer_id):
                        newDerivedLayerCategories.parent_category_id = parent_category

                        category = get_object_or_404(Categories, id=dlcc['id'])
                        newDerivedLayerCategories.category_id = category

                        newDerivedLayerCategories.save()


