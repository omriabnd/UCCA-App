from datetime import datetime

from django.db import models

from uccaApp.models.Categories import Categories
from uccaApp.models.Layers import Layers
from uccaApp.models import Users


class Layers_Categories(models.Model):
    id = models.AutoField(primary_key=True)
    layer_id = models.ForeignKey(Layers,related_name="layers_categories_layer_id",db_column="layer_id",on_delete=models.PROTECT)
    category_id = models.ForeignKey(Categories,related_name="layers_categories_category_id",db_column="category_id",on_delete=models.PROTECT)
    shortcut_key= models.CharField(max_length=50,db_column="category_shortcut_key",null=True,blank=True)
    was_default = models.BooleanField()

    class Meta:
        unique_together = ('category_id', 'layer_id',)
        db_table = "layers_categories"

    def __unicode__(self):
        return self.id