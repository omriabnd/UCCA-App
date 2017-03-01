# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.db import models

from . import Categories, Layers


class Derived_Layers_Categories_Categories(models.Model):
    layer_id = models.ForeignKey(Layers,related_name="layer_id",db_column="layer_id",on_delete=models.PROTECT)
    parent_category_id = models.ForeignKey(Categories,related_name="parent_category_id",db_column="parent_category_id",on_delete=models.PROTECT)
    category_id = models.ForeignKey(Categories,related_name="category_id",db_column="category_id",on_delete=models.PROTECT)


    class Meta:
      unique_together = ('layer_id', 'parent_category_id', 'category_id',)
      db_table = "derived_layers_categories_categories"

