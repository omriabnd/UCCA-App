from datetime import datetime
from django.utils import timezone
from uccaApp.models import Tabs, Constants, Roles
from django.db import models
from django.contrib.auth.models import User, Group


class LogLogin(models.Model):
    id = models.AutoField(primary_key=True)
    login = models.CharField(max_length=100, default='')
    user_id = models.ForeignKey(User,db_column='user_id', null=True, blank=True)
    action = models.CharField(max_length=100, default='')
    data = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='')
    comment = models.CharField(max_length=Constants.COMMENTS_MAX_LENGTH, default='')
    created_at = models.DateTimeField(default=timezone.now, blank=True)

    def __unicode__(self):
        return self.first_name

    class Meta:
        db_table="log_login"

    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
