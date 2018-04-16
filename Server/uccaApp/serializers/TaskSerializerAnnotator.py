from rest_framework.generics import get_object_or_404
from rest_framework import serializers

from uccaApp.util.exceptions import SaveTaskTypeDeniedException, CantChangeSubmittedTaskExeption, GetForInactiveTaskException, TreeIdInvalid, TokensInvalid
from uccaApp.util.functions import get_value_or_none, active_obj_or_raise_exeption
from uccaApp.util.tokenizer import isPunct
from uccaApp.models import Annotation_Remote_Units_Annotation_Units
from uccaApp.models import Annotation_Units_Tokens
from uccaApp.models import Categories
from uccaApp.models import Tokens, Annotation_Units
from uccaApp.models.Annotation_Units_Categories import Annotation_Units_Categories
from uccaApp.models.Tasks import *
from uccaApp.util.aux_functions import *

from uccaApp.serializers.AnnotationUnitsSerializer import Annotation_UnitsSerializer
from uccaApp.serializers.TaskSerializer import TaskInChartSerializer
from uccaApp.serializers.PassageSerializer import PassageSerializer
from uccaApp.serializers.ProjectSerializerForAnnotator import ProjectSerializerForAnnotator
from uccaApp.serializers.TokenSerializer import TokensSerializer
from uccaApp.serializers.UsersSerializer import DjangoUserSerializer_Simplify
import operator, pdb

class TaskSerializerAnnotator(serializers.ModelSerializer):
    created_by = DjangoUserSerializer_Simplify(many=False, read_only=True)
    passage = PassageSerializer(many=False, read_only=True, allow_null=True)
    project = ProjectSerializerForAnnotator(many=False, read_only=True, allow_null=False)
    user = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    tokens = serializers.SerializerMethodField()
    annotation_units = serializers.SerializerMethodField() 
    is_active = serializers.SerializerMethodField()
    
    def get_is_active(self,obj):
        if not obj.is_active:
            raise GetForInactiveTaskException
        return obj.is_active

    def get_user(self,obj):
        return DjangoUserSerializer_Simplify(obj.annotator).data

    def get_parent(self,obj):
        if obj.parent_task is not None:
            return TaskInChartSerializer(obj.parent_task).data
        else:
            return None

    def get_children(self, obj):
        children_tasks = Tasks.objects.all().filter(parent_task_id=obj.id)
        children_json = []
        for cl in children_tasks:
            children_json.append(TaskInChartSerializer(cl).data)
        return children_json


    def get_tokens(self, obj):
        if (obj.type == Constants.TASK_TYPES_JSON['TOKENIZATION']):
            tokens = Tokens.objects.all().filter(task_id=obj.id).order_by('start_index')
        else:
            # get the tokens array from the root tokenization task
            root_tokeniztion_task_id = self.get_root_task(obj)
            tokens = Tokens.objects.all().filter(task_id=root_tokeniztion_task_id)

        tokens_json = []
        for t in tokens:
            tokens_json.append(TokensSerializer(t).data)

        tokens_json.sort(key=lambda x: x["start_index"])
        return tokens_json

    def get_annotation_units(self, obj):
        # **********************************
        #           AS ARRAY
        # **********************************
        orig_obj = None
        annotation_units = Annotation_Units.objects.all().filter(task_id=obj.id)

        # handle new refinement or extention layer taks - get the parent annotation units - start
        if( len(annotation_units) == 0  and obj.parent_task is not None): # TODO: check if coarsening task is ok with that
            # get the parent task annotation units
            orig_obj = obj
            obj = obj.parent_task
            annotation_units = Annotation_Units.objects.all().filter(task_id=obj.id)
        # handle new refinement or extention layer taks - get the parent annotation units - end


        annotation_units_json = []
        remote_annotation_unit_array = []
        for au in annotation_units:
            # set as default is_remote_copy = False
            au.is_remote_copy = False

            # check if i have a remote units
            remote_units = Annotation_Remote_Units_Annotation_Units.objects.all().filter(unit_id=au)
            for ru in remote_units:
                # retrieve its original unit
                remote_original_unit = Annotation_Units.objects.get(id = ru.remote_unit_id.id, task_id=obj.id)
                # set the remote is_remote_copy = true
                remote_original_unit.is_remote_copy = True
                # set the parent_id to be the remote's one
                remote_original_unit.parent_id = ru.unit_id
                # setting the cloned_from tree_id
                cloned_from_tree_id = remote_original_unit.tree_id
                # set the tree_id to be that of the remote unit
                remote_original_unit.tree_id = ru.remote_unit_tree_id
                # add the remote original unit to the json output
                annotation_units_json.append(Annotation_UnitsSerializer(remote_original_unit,context={'cloned_from_tree_id': cloned_from_tree_id}).data)

            au_data = Annotation_UnitsSerializer(au).data

            if (orig_obj and orig_obj.project.layer.type != Constants.LAYER_TYPES_JSON['ROOT']):
                # take Annotation_UnitsSerializer(au).data, and alter slot to be 3+
                for index,cat in enumerate(au_data['categories']):
                    au_data['categories'][index]['slot'] = 3 + index
            annotation_units_json.append(au_data)
            
        # return all array sorted with all the remote units in the end

        return sorted(annotation_units_json, key=lambda x: tuple(x['tree_id'].split('-')))

        #return sorted(annotation_units_json, key=operator.itemgetter('is_remote_copy'), reverse=False)

        # **********************************
        #           AS ROOT OBJECT
        # **********************************
        # try:
        #     au = Annotation_Units.objects.get(task_id_id=obj.id, parent_id=None)
        # except Annotation_Units.DoesNotExist:
        #     au = None
        # return Annotation_UnitsSerializer(au).data



    def get_root_task(self,task_instance):
        root_task = task_instance
        while (root_task.parent_task != None ):
            root_task = root_task.parent_task
        return root_task.id


    class Meta:
        model = Tasks
        fields = (
            'id',
            'parent',
            'children',
            'type',
            'project',
            'user',
            'passage',
            'tokens',
            'annotation_units',
            'is_demo',
            'manager_comment',
            'user_comment',
            'is_active',
            'created_by',
            'created_at',
            'updated_at'
        )


    def update(self, instance, validated_data):
        if instance.status == 'SUBMITTED':
            raise CantChangeSubmittedTaskExeption

        save_type = self.context['save_type']
        if(save_type  == 'draft'):
            self.save_draft(instance)
        elif (save_type  == 'submit'):
            self.submit(instance)
        elif (save_type == 'reset'):
            self.reset(instance)
    
        return instance


    def reset(self,instance):
        instance.status = Constants.TASK_STATUS_JSON['NOT_STARTED']
        instance.user_comment = ''
        if (instance.type == Constants.TASK_TYPES_JSON['TOKENIZATION']):
            self.reset_tokenization_task(instance)
        else:
            self.reset_current_task(instance)
        instance.save()
        

    def save_draft(self,instance):
        instance.status = 'ONGOING'
        print('save_draft')
        if (instance.type == Constants.TASK_TYPES_JSON['TOKENIZATION']):
            self.save_tokenization_task(instance)
        elif (instance.type == Constants.TASK_TYPES_JSON['ANNOTATION']):
            self.save_annotation_task(instance)
        elif (instance.type == Constants.TASK_TYPES_JSON['REVIEW']):
            self.save_review_task(instance)
        instance.save()


    def reset_tokenization_task(self,instance):
        self.check_if_parent_task_ok_or_exception(instance)
        instance.tokens_set.all().delete()

    def reset_annotation_task(self,instance):
        self.check_if_parent_task_ok_or_exception(instance)
        instance.tokens_set.all().delete()

    def save_tokenization_task(self,instance):
        print('save_tokenization_task - start')
        self.check_if_parent_task_ok_or_exception(instance)
        instance.tokens_set.all().delete()
        for token in self.initial_data['tokens']:
            newToken = Tokens()
            newToken.task_id_id = instance
            newToken.text = token['text']
            newToken.require_annotation = ( not isPunct(newToken.text) )
            newToken.start_index = token['start_index']
            newToken.end_index = token['end_index']
            instance.tokens_set.add(newToken,bulk=False)
        print('save_tokenization_task - end')



    def save_annotation_task(self,instance):
        print('save_annotation_task - start')

        # mainly saving an annotations units array
        self.check_if_parent_task_ok_or_exception(instance)
        self.reset_current_task(instance)
        remote_units_array = []
        instance.user_comment = self.initial_data['user_comment']

        # validating tokens
        tokens = self.initial_data['tokens']
        if not strictly_increasing([x['start_index'] for x in tokens]):
            raise TokensInvalid("tokens should be ordered by their start_index")
        tokens_id_to_startindex = dict([(x['id'], x['start_index']) for x in tokens])
        children_tokens_list_for_validation = []
        for au in self.initial_data['annotation_units']:
            cur_children_tokens = au.get('children_tokens')
            try:
                if cur_children_tokens:
                    cur_children_tokens_start_indices = [tokens_id_to_startindex[x['id']] for x in cur_children_tokens]
                else:
                    if au['type'] == 'IMPLICIT' or au['tree_id'] == '0':
                        cur_children_tokens_start_indices = None
                    else:
                        raise TokensInvalid("Only implicit units may not have a children_tokens field")
            except KeyError:
                raise TokensInvalid("children_tokens contains a token which is not in the task's tokens list.")
            children_tokens_list_for_validation.append((au['tree_id'],(au['parent_tree_id'],au['is_remote_copy'],cur_children_tokens_start_indices)))
        if not check_children_tokens(dict(children_tokens_list_for_validation)):
            raise TokensInvalid("Inconsistency in children_tokens detected.")

        all_tree_ids = [] # a list of all tree_ids by their order in the input

        for au in self.initial_data['annotation_units']:
            annotation_unit = Annotation_Units()
            if is_correct_format_tree_id(au['tree_id']):
                annotation_unit.tree_id = au['tree_id']
                all_tree_ids.append(au['tree_id'])
            else:
                raise TreeIdInvalid("tree_id is in an incorrect format; fix unit " + str(annotation_unit.tree_id))

            annotation_unit.task_id = instance
            annotation_unit.type = au['type']
            annotation_unit.comment = au['comment']
            annotation_unit.cluster = au['cluster']

            annotation_unit.is_remote_copy = au['is_remote_copy']

            parent_id = None
            if au['parent_tree_id']:
                if not is_correct_format_tree_id(au['parent_tree_id']):
                    raise TreeIdInvalid("parent_tree_id is in an incorrect format; fix unit "+str(annotation_unit.tree_id))
                if not is_correct_format_tree_id_child(au['parent_tree_id'],au['tree_id']):
                    raise TreeIdInvalid("parent_tree_id and tree_id do not match in format; fix unit " + str(annotation_unit.tree_id))

                parent_id = get_object_or_404(Annotation_Units, tree_id=au['parent_tree_id'],task_id=instance.id)
            else:
               if annotation_unit.tree_id != '0':
                   raise TreeIdInvalid("All annotation units but unit 0 must have a valid, non-null tree_id; fix unit "+str(annotation_unit.tree_id))

            annotation_unit.parent_id = parent_id
            annotation_unit.gui_status = au['gui_status']

            if annotation_unit.is_remote_copy:

                annotation_unit.remote_categories = get_value_or_none('categories', au)
                if au['cloned_from_tree_id']:
                    if not is_correct_format_tree_id(au['cloned_from_tree_id']):
                        raise TreeIdInvalid("cloned_from_tree_id is in an incorrect format; fix unit " + str(
                            annotation_unit.tree_id))
                    annotation_unit.cloned_from_tree_id = au['cloned_from_tree_id']
                else:
                    raise TreeIdInvalid("cloned_from_tree_id should be defined for all remote units")
                remote_units_array.append(annotation_unit)
            else: # not a remote unit
                if au['cloned_from_tree_id']:
                    raise TreeIdInvalid("cloned_from_tree_id should not be defined for non-remote units")
                instance.annotation_units_set.add(annotation_unit,bulk=False)
                self.save_children_tokens(annotation_unit, get_value_or_none('children_tokens', au),tokens_id_to_startindex)
                self.save_annotation_categories(annotation_unit, get_value_or_none('categories', au))

        if not is_tree_ids_uniq_and_consecutive(all_tree_ids):
            raise TreeIdInvalid("tree_ids within a unit should be unique and consecutive")

        for annotation_unit in remote_units_array:
            remote_unit = self.save_annotation_remote_unit(annotation_unit)
            self.save_remote_annotation_categories(remote_unit,annotation_unit.remote_categories)

        print('save_annotation_task - end')


    def save_remote_annotation_categories(self,remote_annotation_unit,categories):
        print('save_remote_annotation_categories - start')
        for cat in categories:
            unit_category = Annotation_Units_Categories()
            unit_category.unit_id = remote_annotation_unit.remote_unit_id
            unit_category.category_id = Categories.objects.get(id=cat['id'])
            unit_category.remote_parent_id = remote_annotation_unit.unit_id

            # Omri added Sep 12:
            if 'slot' in cat:    # Omri TODO: disallow the option not to specify a slot
                unit_category.slot = cat['slot']
            else:
                unit_category.slot = 1

            unit_category.save()
        print('save_remote_annotation_categories - end')

    def reset_current_task(self,task_instance):
        # TODO: validate the new array of annotation units before deleting the current one
        print('reset_current_task - start')
        # reset Annotation_Units_Tokens
        # reset Annotation_Units_Categories
        # reset Annotation_Remote_Units_Annotation_Units
        # reset annotaion_units
        task_instance.annotation_units_set.all().delete()
        print('reset_current_task - end')


    def save_annotation_remote_unit(self,annotation_unit):
        remote_unit = Annotation_Remote_Units_Annotation_Units()

        # remote_unit.unit_id means that it is the parent
        remote_unit.unit_id = annotation_unit.parent_id

        # remote_unit.remote_unit_id means that it is the unit it was cloned from
        remote_unit_id = get_object_or_404(Annotation_Units, tree_id=annotation_unit.cloned_from_tree_id, task_id=annotation_unit.task_id )
        remote_unit.remote_unit_id = remote_unit_id

        # saving the tree_id of the remote unit
        remote_unit.remote_unit_tree_id =annotation_unit.tree_id

        remote_unit.save()
        return remote_unit

    def save_children_tokens(self,annotation_unit,tokens,id_to_start_index):
        if tokens != None:
            print('save_children_tokens - start')
            for t in tokens:
                annotation_units_token = Annotation_Units_Tokens()
                annotation_units_token.unit_id = annotation_unit
                annotation_units_token.token_id = Tokens.objects.get(id=t['id'])
                annotation_units_token.save()
            print('save_children_tokens - end')



    def save_annotation_categories(self,annotation_unit,categories):
        print('save_annotation_categories - start')
        for cat in categories:
            unit_category = Annotation_Units_Categories()
            unit_category.unit_id = annotation_unit
            unit_category.category_id = Categories.objects.get(id=cat['id'])
            if 'slot' in cat:    # Omri TODO: disallow the option not to specify a slot
                unit_category.slot = cat['slot']
            else:
                unit_category.slot = 1
            unit_category.remote_parent_id = None
            unit_category.save()
        print('save_annotation_categories - end')



    def save_review_task(self,instance):
        # TODO: CHECK IF OK !!!!
        print('save_review_task - start')
        self.save_annotation_task(instance)
        print('save_review_task - end')


    def submit(self,instance):
        instance.status = 'SUBMITTED'
        print('submit')
        instance.save(update_fields=['status'])

    def check_if_parent_task_ok_or_exception(self,instance):
        if instance.type == Constants.TASK_TYPES_JSON['TOKENIZATION']:
            if instance.parent_task != None:
                raise SaveTaskTypeDeniedException
        elif instance.parent_task == None:
            raise SaveTaskTypeDeniedException


