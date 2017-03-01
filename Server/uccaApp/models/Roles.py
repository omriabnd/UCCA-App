# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.db import models
from uccaApp.models import Constants
from .Tabs import Tabs


class Roles(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, choices=Constants.ROLE_NAMES)

    def __unicode__(self):
        return self.name

    class Meta:
        db_table="roles"