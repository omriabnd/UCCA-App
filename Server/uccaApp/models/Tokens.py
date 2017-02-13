from django.db import models
from uccaApp.models import Constants,Tasks

class Tokens(models.Model):
  id = models.AutoField(primary_key=True)
  task_id = models.ForeignKey(Tasks,on_delete=models.PROTECT)
  require_annotation = models.BooleanField()
  text = models.CharField(max_length=Constants.TOKEN_MAX_LENGTH)
  start_index = models.IntegerField()
  end_index = models.IntegerField()

  def __unicode__(self):
    return self.id

  class Meta:
    db_table = "tokens"
