# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from rest_framework.generics import get_object_or_404
from django.utils import timezone

from uccaApp.models import Annotation_Remote_Units_Annotation_Units
from uccaApp.models import Annotation_Units
from uccaApp.models import Annotation_Units_Categories
from uccaApp.models import Categories, Derived_Layers_Categories_Categories
from uccaApp.models import Layers_Categories
from uccaApp.serializers import CategorySerializer
from uccaApp.serializers import LayersCategoriesSerializer
from uccaApp.serializers.AnnotationUnitsSerializer import Annotation_UnitsSerializer
from uccaApp.util.exceptions import CreateAnnotationTaskDeniedException, CreateCoarseningAnnotationTaskDeniedException
from uccaApp.util.tokenizer import tokenize
from uccaApp.models import Tokens
from uccaApp.models.Tasks import *
from rest_framework import serializers

from uccaApp.serializers import PassageSerializer_Simplify
from uccaApp.util.functions import active_obj_or_raise_exeption, get_value_or_none
from uccaApp.serializers.ProjectSerializerSimple import ProjectSerializer_Simplify
from uccaApp.serializers.TaskSerializerSimple import TaskSerializer_Simplify
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify

class TaskInChartSerializer(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    passage = PassageSerializer_Simplify(many=False, read_only=True,allow_null=True)
    project = ProjectSerializer_Simplify(many=False, read_only=True,allow_null=False)
    user = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()

    def get_user(self,obj):
        return DjangoUserSerializer_Simplify(obj.annotator).data

    def get_parent(self,obj):
        if obj.parent_task is not None:
            return TaskSerializer_Simplify(obj.parent_task).data
        else:
            return None

    def get_children(self, obj):
        children_tasks = Tasks.objects.all().filter(parent_task_id=obj.id)
        children_json = []
        for cl in children_tasks:
            children_json.append(TaskSerializer_Simplify(cl).data)
        return children_json



    class Meta:
        model = Tasks
        fields = (
            'id',
            'parent',
            'children',
            'type',
            'status',
            'project',
            'user',
            'passage',
            'is_demo',
            'manager_comment',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )

    def create(self, validated_data):
        ownerUser = self.initial_data['created_by']
        validated_data['created_by'] = ownerUser
        project = get_object_or_404(Projects, pk=self.initial_data['project']['id'])
        annotator = get_object_or_404(Users, pk=self.initial_data['user']['id'])
        passage = get_object_or_404(Passages, pk=self.initial_data['passage']['id'])
        parent = None
        if self.initial_data['parent']:
            parent = get_object_or_404(Tasks, pk=get_value_or_none('id', self.initial_data['parent']))
            active_obj_or_raise_exeption(parent)

        newTask = Tasks()
        newTask.created_by = ownerUser
        newTask.parent_task = parent
        newTask.status = Constants.TASK_STATUS_JSON['NOT_STARTED']
        newTask.type = validated_data['type']
        newTask.is_demo = validated_data['is_demo']
        newTask.manager_comment = validated_data['manager_comment']
        newTask.is_active = validated_data['is_active']
        newTask.project = project
        newTask.annotator = annotator
        newTask.passage = passage
        newTask.created_at = timezone.now()

        active_obj_or_raise_exeption(project)
        active_obj_or_raise_exeption(annotator)
        active_obj_or_raise_exeption(passage)

        if(newTask.type == Constants.TASK_TYPES_JSON['TOKENIZATION']):
            newTask.save()
            self.generate_and_save_tokens(newTask)
        elif(newTask.type == Constants.TASK_TYPES_JSON['ANNOTATION'] or (newTask.type == Constants.TASK_TYPES_JSON['REVIEW'])):
            if(self.has_parent_task(newTask)):
                self.save_task_by_layer_type(newTask)
            else:
                raise CreateAnnotationTaskDeniedException

        return newTask

    def update(self, instance, validated_data):
        # avoid changing the layer's type
        validated_data['type'] = instance.type

        # allow update only status is_demo is_active manager_comment

        # continue updating the layer's attributes
        return super(self.__class__, self).update(instance, validated_data)


    def has_parent_task(self,task):
        return hasattr(task,'parent_task') and task.parent_task != None

    def is_parent_of_other_tasks(self, instance):
        children_list = Tasks.objects.all().filter(parent_task_id=instance.id)
        is_parent = len(children_list) > 0
        return is_parent

    def generate_and_save_tokens(self,taskInstance):
        tokens_arr = tokenize(taskInstance.passage.text)
        taskInstance.tokens_set.all().delete()
        # self.get_object()
        for token in tokens_arr:
            newToken = Tokens()
            newToken.require_annotation = (not token['is_punctuation'])
            newToken.text = token['text']
            newToken.start_index = token['start_index']
            newToken.end_index = token['end_index']

            taskInstance.tokens_set.add(newToken,bulk=False)

    def save_task_by_layer_type(self,task):
        task_layer = task.project.layer
        if(task_layer.type == Constants.LAYER_TYPES_JSON['ROOT']):
            print('save_task_by_layer_type - ROOT - start')
            task.save()
            print('save_task_by_layer_type - ROOT - end')
        elif (task_layer.type == Constants.LAYER_TYPES_JSON['EXTENSION']):
            print('save_task_by_layer_type - EXTENSION - start')
            task.save()
            print('save_task_by_layer_type - EXTENSION - end')
        elif (task_layer.type == Constants.LAYER_TYPES_JSON['REFINEMENT']):
            print('save_task_by_layer_type - REFINEMENT - start')
            task.save()
            print('save_task_by_layer_type - REFINEMENT - end')
        elif (task_layer.type == Constants.LAYER_TYPES_JSON['COARSENING']):
            self.save_coarsening_task_process(task)

        return task


    def save_coarsening_task_process(self,task):
        print('save_task_by_layer_type - COARSENING - start')
        # make sure that the parent task is not tokenization task
        if (task.parent_task.type == Constants.TASK_TYPES_JSON['TOKENIZATION']):
            raise CreateCoarseningAnnotationTaskDeniedException
        else:
            # set the task type to ONGOING
            task.status = Constants.TASK_STATUS_JSON['ONGOING']

            # save the task
            task.save()

            # e.g. there are 3 categories that bacome 1 category so:
            parent_task_annotation_units = task.parent_task.annotation_units_set.all().order_by('id')
            coarsenned_categories = self.get_coarsenned_categories(task.project.layer)
            remote_units_array = []
            # go over all of the annotation units in this task
            # - for each unit, if one of the old categories exists - replace it with the new category
            for parent_au in parent_task_annotation_units:
                parent_au = Annotation_UnitsSerializer(parent_au).data
                annotation_unit = Annotation_Units()
                annotation_unit.annotation_unit_tree_id = parent_au['annotation_unit_tree_id']
                annotation_unit.task_id = Tasks.objects.get(id=parent_au['task_id'])
                annotation_unit.type = parent_au['type']
                annotation_unit.comment = parent_au['comment']
                annotation_unit.gui_status = parent_au['gui_status']
                annotation_unit.is_remote_copy = parent_au['is_remote_copy']

                parent_annotation_unit = self.get_parent_annotation_unit_or_none(parent_au['parent_id'],task.id)

                annotation_unit.parent_id = parent_annotation_unit

                task.annotation_units_set.add(annotation_unit, bulk=False)
                self.save_coarsening_annotation_categories(annotation_unit, parent_au, coarsenned_categories)

                # check if i have a remote units
                remote_units = Annotation_Remote_Units_Annotation_Units.objects.all().filter(unit_id=parent_au['id'])
                for ru in remote_units:
                    # retrieve its original unit
                    remote_original_unit = Annotation_Units.objects.get(id=ru.remote_unit_id.id, task_id=task.parent_task.id)

                    remote_original_unit_in_coarsening_task = Annotation_Units.objects.get(
                        annotation_unit_tree_id=remote_original_unit.annotation_unit_tree_id, task_id=task.id)

                    unit_id_remote_original_unit = Annotation_Units.objects.get(
                        id=ru.unit_id.id, task_id=task.parent_task.id)

                    unit_id_remote_original_unit_in_coarsening_task = Annotation_Units.objects.get(
                        annotation_unit_tree_id=unit_id_remote_original_unit.annotation_unit_tree_id, task_id=task.id)

                    # set the remote is_remote_copy = true
                    remote_original_unit_in_coarsening_task.is_remote_copy = True

                    # set the parent_id to be the remote's one
                    remote_original_unit_in_coarsening_task.parent_id = unit_id_remote_original_unit_in_coarsening_task

                    # get its original categories
                    originial_remote_categories = Annotation_Units_Categories.objects.all().filter(
                        unit_id=remote_original_unit,remote_parent_id=unit_id_remote_original_unit)

                    # set the remote categories to the coarsening task
                    remote_categories = []
                    for cat in originial_remote_categories:
                        annotation_unit_categories = Annotation_Units_Categories()
                        annotation_unit_categories.unit_id = remote_original_unit_in_coarsening_task
                        annotation_unit_categories.remote_parent_id = unit_id_remote_original_unit_in_coarsening_task
                        annotation_unit_categories.category_id = cat.category_id
                        annotation_unit_categories.save()
                        remote_categories.append(annotation_unit_categories)

                        # TODO: save coaesened category to remote units in coarsening task
                        # if cat.remote_parent_id != None:
                        # # if the category is the coarsened one, add it to the annotation unit
                        # coarsend_category = self.get_coarsening_layer_category_or_none(coarsenned_categories, cat.category_id)
                        # if coarsend_category is not None:
                        #     coarsend_unit_category = Annotation_Units_Categories()
                        #     coarsend_unit_category.unit_id = remote_original_unit_in_coarsening_task
                        #     coarsend_unit_category.category_id = coarsend_category
                        #     coarsend_unit_category.remote_parent_id = unit_id_remote_original_unit_in_coarsening_task
                        #     try:
                        #       coarsend_unit_category.save()
                        #     except:
                        #       print("already saved")

                    remote_original_unit_in_coarsening_task.remote_categories = remote_categories

                    # add the remote original unit to the json output
                    remote_units_array.append(remote_original_unit_in_coarsening_task)

            for annotation_remote_unit in remote_units_array:
                remote_unit = self.save_coarsening_annotation_remote_unit(annotation_remote_unit)
                self.save_coarsening_remote_annotation_categories(remote_unit, annotation_remote_unit.remote_categories)

            # set the task status to SUBMITTED
            task.status = Constants.TASK_STATUS_JSON['SUBMITTED']
            task.save()

        print('save_task_by_layer_type - COARSENING - end')

    def save_coarsening_remote_annotation_categories(self,remote_annotation_unit,categories):
        print('save_remote_annotation_categories - start')
        for cat in categories:
          unit_category = Annotation_Units_Categories()
          unit_category.unit_id = remote_annotation_unit.remote_unit_id
          unit_category.category_id = cat.category_id
          unit_category.remote_parent_id = remote_annotation_unit.unit_id
          try:
              unit_category.save()
          except:
              print('already saved remote category')
        print('save_remote_annotation_categories - end')

    def save_coarsening_annotation_remote_unit(self, annotation_unit):
        print("save_coarsening_annotation_remote_unit - start")
        remote_unit = Annotation_Remote_Units_Annotation_Units()
        # remote_unit.unit_id means that it is the parent
        remote_unit.unit_id = annotation_unit.parent_id
        # remote_unit.remote_unit_id means that it is the remote unit
        remote_unit_id = get_object_or_404(Annotation_Units,
                                           annotation_unit_tree_id=annotation_unit.annotation_unit_tree_id,
                                           task_id=annotation_unit.task_id)
        remote_unit.remote_unit_id = remote_unit_id
        remote_unit.save()
        print("save_coarsening_annotation_remote_unit - end")
        return remote_unit

    def save_coarsening_annotation_categories(self,annotation_unit,parent_au,coarsenned_categories):
        # add and duplicate all the parents annotation_units categories
        if parent_au['categories'] is not None:
            for cat in parent_au['categories']:
                unit_category = Annotation_Units_Categories()
                unit_category.unit_id = annotation_unit
                unit_category.category_id = Categories.objects.get(id=cat['id'])
                unit_category.remote_parent_id = None  # TODO: can it be other then none ?
                unit_category.save()

                # if the category is the coarsened one, add it to the annotation unit
                coarsend_category = self.get_coarsening_layer_category_or_none(coarsenned_categories, cat)
                if coarsend_category is not None:
                    coarsend_unit_category = Annotation_Units_Categories()
                    coarsend_unit_category.unit_id = annotation_unit
                    coarsend_unit_category.category_id = coarsend_category
                    coarsend_unit_category.remote_parent_id = None  # TODO: can it be other then none ?
                    try:
                        coarsend_unit_category.save()
                    except:
                        print("already saved")

    def get_parent_annotation_unit_or_none(self,parent_au_id,task_id):
        try:
            return Annotation_Units.objects.get(annotation_unit_tree_id=parent_au_id, task_id=task_id)
        except:
            return None

    def get_coarsenned_categories(self,layer):
        # changed_categories object = {"parent_category_id" : "into_category_id"}
        changed_categories = {}

        derived_layer_categories = Derived_Layers_Categories_Categories.objects.all().filter(layer_id=layer.id)
        for d_l_cat in derived_layer_categories :
            changed_categories[d_l_cat.parent_category_id_id] = d_l_cat.category_id_id

        return changed_categories

    def get_coarsening_layer_category_or_none(self,coarsenned_categories,cat):
        try:
            if coarsenned_categories[cat['id']] is not None:
                cat_to_add = Categories.objects.get(id=coarsenned_categories[cat['id']])
                # TODO: check if the cat_to_add already excsit in the parent_au
                # parent_au['categories'].append(cat_to_add)
        except:
            # cat_to_add = Categories.objects.get(id=cat['id'])
            cat_to_add = None
        return cat_to_add
