# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from datetime import datetime

from django.contrib.auth.models import User
from django.db import models
from uccaApp.models import Layers, Users, Constants


class Projects(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=Constants.DESCRIPTION_MAX_LENGTH)
    tooltip = models.CharField(max_length=Constants.TOOLTIPS_MAX_LENGTH)
    layer = models.ForeignKey(Layers,null=False,blank=False,db_column="layer_id", on_delete=models.PROTECT, default='')

    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    class Meta:
        db_table = "projects"
