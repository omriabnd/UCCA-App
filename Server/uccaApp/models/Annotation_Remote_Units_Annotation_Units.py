from django.db import models
from uccaApp.models.Annotation_Units import Annotation_Units


class Annotation_Remote_Units_Annotation_Units(models.Model):
    unit_id = models.ForeignKey(Annotation_Units,related_name="parent_unit_id",on_delete=models.CASCADE)
    remote_unit_id = models.ForeignKey(Annotation_Units,null=True,blank=True, related_name="remote_unit_id",on_delete=models.CASCADE)

    class Meta:
        unique_together = ('unit_id', 'remote_unit_id',)
        db_table = "annotation_remote_units_annotation_units"
