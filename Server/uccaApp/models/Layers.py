from datetime import datetime

from django.contrib.auth.models import User
from django.db import models

# from uccaApp.models.Layers_Categories import Layers_Categories
# from uccaApp.models.Layers_Categories_Restrictions import Layers_Categories_Restrictions
# from uccaApp.models.Derived_Layers_Categories_Categories import Derived_Layers_Categories_Categories
from uccaApp.models import Constants, Categories, Users


class Layers(models.Model):
    id = models.AutoField(primary_key=True)

    parent_layer_id = models.ForeignKey('self', related_name='parent_id', blank=True,null=True,db_column="parent_layer_id", on_delete=models.PROTECT)

    type = models.CharField(max_length=50, choices=Constants.LAYER_TYPES, default=1)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=Constants.DESCRIPTION_MAX_LENGTH)
    tooltip = models.CharField(max_length=Constants.TOOLTIPS_MAX_LENGTH)
    slotted = models.BooleanField(null=False, default=False)
    category_reorderings = models.TextField(default='', null=True)
    restriction_all_tokens_covered_upon_submit = models.BooleanField(null=False,default=True)

    created_by = models.ForeignKey(User, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = "layers"
