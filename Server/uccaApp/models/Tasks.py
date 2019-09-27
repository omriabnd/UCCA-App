import pdb
from datetime import datetime
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from uccaApp.models import Users, Constants, Passages, Projects
from django.dispatch import receiver



class Tasks(models.Model):

    id = models.AutoField(primary_key=True)
    
    project = models.ForeignKey(Projects,null=False,blank=False,db_column="project_id", on_delete=models.PROTECT, default='')
    passage = models.ForeignKey(Passages, null=True ,blank=True,db_column="passage_id", on_delete=models.PROTECT)
    annotator = models.ForeignKey(Users,related_name='user_id', null=True ,blank=True,db_column="user_id", on_delete=models.PROTECT)
    parent_task = models.ForeignKey('self',related_name='parent_id',db_column="parent_id", null=True ,blank=True, on_delete=models.PROTECT)
    
    type = models.CharField(max_length=256, choices = Constants.TASK_TYPES,db_column="task_type",default=1)
    status = models.CharField(max_length=256, choices = Constants.TASK_STATUS)
    is_demo = models.BooleanField()
    manager_comment = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='')
    user_comment = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='', blank=True)
    
    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    out_of_date = models.BooleanField(default=False)
    obsoleted_by = models.IntegerField(null=True,default=None)
    parent_obsoleted_by = models.IntegerField(null=True,default=None)

    annotation_json = models.ForeignKey("Annotation_Json", null=True)
    tokens_json = models.ForeignKey("Tokens_Json", null=True)


    """
    def get_out_of_date(self):
        if self.project.layer.type != Constants.LAYER_TYPES_JSON['ROOT'] and \
               self.parent_task is not None:
            num_of_submitted_review_tasks = \
                Tasks.objects.all().filter(parent_task_id=self.parent_task.id,\
                                           type=Constants.TASK_TYPES_JSON['REVIEW'],status=Constants.TASK_STATUS_JSON['SUBMITTED']).count()
            return (num_of_submitted_review_tasks > 0)
        else:
            return False
    """

    def save(self, *args, **kwargs):
        super(Tasks, self).save(*args, **kwargs)
        if self.type == Constants.TASK_TYPES_JSON['REVIEW'] and \
               self.status == Constants.TASK_STATUS_JSON['SUBMITTED']:

            # if obsolete_by is still null, update it to self.id
            if self.parent_task.obsoleted_by is None:
                self.parent_task.obsoleted_by = self.id
                self.parent_task.out_of_date = True
                self.parent_task.save()

            # update all brothers of self, which are not review tasks (i.e., are deriviative tasks)
            # and have parent_obsoleted_by as None, to have parent_obsoleted_by to be self.id
            Tasks.objects.all().filter(parent_task_id=self.parent_task.id,parent_obsoleted_by=None).exclude(type=Constants.TASK_TYPES_JSON['REVIEW']).update(parent_obsoleted_by=self.id,out_of_date=True)


    def __unicode__(self):
        return self.name
    
    class Meta:
        db_table="tasks"



@receiver(post_save, sender=Tasks)
def update_is_active_in_children(sender, instance, **kwargs):
    if instance.status == Constants.TASK_STATUS_JSON['SUBMITTED'] and kwargs['update_fields'] and ('status' in kwargs['update_fields']):
        Tasks.objects.all().filter(parent_task_id=instance.id).update(is_active=True)
    
    
    
