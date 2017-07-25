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
