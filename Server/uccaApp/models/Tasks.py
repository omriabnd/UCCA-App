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

    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)


    def __unicode__(self):
        return self.name

    class Meta:
        db_table="tasks"

    
@receiver(post_save, sender=Tasks)
def update_is_active_in_children(sender, instance, **kwargs):
    if instance.status == Constants.TASK_STATUS_JSON['SUBMITTED'] and ('status' in kwargs['update_fields']):
        child_tasks = Tasks.objects.filter(parent_task__id=instance.id).update(is_active=True)
    
    
    
