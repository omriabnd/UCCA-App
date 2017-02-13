from django.db import models
from uccaApp.models import Constants, Layers, Categories, Users, datetime
from .Roles import *

class Layers_Categories_Restrictions(models.Model):
    id = models.AutoField(primary_key=True)
    layer_id = models.ForeignKey(Layers,related_name="resriction_layer_id",db_column="layer_id",on_delete=models.PROTECT)
    resriction_type = models.CharField(max_length=256,choices=Constants.RESTRICTION_TYPES)
    category_ids1 = models.CharField(max_length=1000)
    category_ids2 = models.CharField(max_length=1000)


    class Meta:
        db_table = "layers_categories_restrictions"

