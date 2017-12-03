from datetime import datetime
from django.utils import timezone
from uccaApp.models import Tabs, Constants, Roles
from django.db import models
from django.contrib.auth.models import User, Group


class LogAction(models.Model):

    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User,db_column='user_id', null=True, blank=True)
    action = models.CharField(max_length=100, default='')
    data = models.TextField(default='')
    comment = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='')
    created_at = models.DateTimeField(default=timezone.now, blank=True)

    def __unicode__(self):
        return self.first_name

    class Meta:
        db_table="log_action"
