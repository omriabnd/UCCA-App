# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from datetime import datetime

from uccaApp.models import Constants
from .Users import Users
from django.db import models
from django.contrib.auth.models import User


class Sources(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    text = models.CharField(max_length=Constants.DESCRIPTION_MAX_LENGTH, default='')

    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    def __unicode__(self):
        return self.name

    class Meta:
        db_table="sources"
