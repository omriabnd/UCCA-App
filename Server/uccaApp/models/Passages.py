from datetime import datetime
from django.contrib.auth.models import User
from uccaApp.models import Constants, Sources
from django.db import models

class Passages(models.Model):
    id = models.AutoField(primary_key=True)
    text = models.CharField(max_length=Constants.PASSAGES_TEXT_MAX_LENGTH)
    type = models.CharField(max_length=50, choices=Constants.PASSAGE_TYPES)
    source = models.ForeignKey(Sources,null=False,blank=False,db_column='source_id',on_delete=models.PROTECT)
    external_id = models.CharField(max_length=100,blank=True)
    
    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        db_table = "passages"
