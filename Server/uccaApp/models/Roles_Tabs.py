# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.db import models
from uccaApp.models import Constants
from .Tabs import *
from .Roles import *


class Roles_Tabs(models.Model):
    role_id = models.ForeignKey(Roles)
    tab_id = models.ForeignKey(Tabs)

    class Meta:
        unique_together = ('role_id', 'tab_id',)
        db_table="roles_tabs"
