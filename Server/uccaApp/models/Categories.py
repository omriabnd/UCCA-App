# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from datetime import datetime
from django.db import models
from django.contrib.auth.models import User

from uccaApp.models import Constants


class Categories(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=Constants.DESCRIPTION_MAX_LENGTH)
    tooltip = models.CharField(max_length=Constants.TOOLTIPS_MAX_LENGTH)
    is_default = models.NullBooleanField(blank=True,null=True)
    abbreviation = models.CharField(max_length=3)
    created_by = models.ForeignKey(User,null=True,blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "categories"
