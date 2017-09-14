from django.db import models
from uccaApp.models.Tokens import Tokens
from uccaApp.models.Annotation_Units import Annotation_Units


class Annotation_Units_Tokens(models.Model):
    unit_id = models.ForeignKey(Annotation_Units,on_delete=models.CASCADE)
    token_id = models.ForeignKey(Tokens,on_delete=models.CASCADE)

    class Meta:
        unique_together = ('unit_id', 'token_id',)
        db_table = "annotation_units_tokens"


