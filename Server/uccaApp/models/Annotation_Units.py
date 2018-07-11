from django.db import models
from uccaApp.models import Constants,Tasks


class Annotation_Units(models.Model):
    id = models.AutoField(primary_key=True)
    tree_id = models.CharField(null=False,blank=False,max_length=Constants.ANNOTATION_UNIT_ID_MAXLENGTH,default='1')
    task_id = models.ForeignKey(Tasks,on_delete=models.PROTECT)
    type = models.CharField(max_length=50, choices=Constants.ANNOTATION_UNIT_TYPES)
    comment = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='')
    cluster = models.CharField(max_length=Constants.CLUSTER_MAX_LENGTH, default='')
    parent_id = models.ForeignKey('self',null=True,blank=True)
    gui_status = models.CharField(max_length=50, choices=Constants.ANNOTATION_GUI_STATUS)
    is_finished = models.BooleanField(null=False, default=False)

    def __unicode__(self):
      return self.id

    class Meta:
        unique_together = ('id', 'task_id',)
        db_table = "annotation_units"
