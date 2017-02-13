from django.db import models
from uccaApp.models.Categories import Categories
from uccaApp.models.Annotation_Units import Annotation_Units


class Annotation_Units_Categories(models.Model):
    unit_id = models.ForeignKey(Annotation_Units,related_name="unit_id",on_delete=models.CASCADE)
    category_id = models.ForeignKey(Categories, on_delete=models.PROTECT)
    remote_parent_id = models.ForeignKey(Annotation_Units,null=True,blank=True, related_name="remote_parent_id",on_delete=models.CASCADE)

    class Meta:
        unique_together = ('unit_id', 'category_id', 'remote_parent_id',)
        db_table = "annotation_units_categories"





