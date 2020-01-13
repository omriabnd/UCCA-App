from django.db import models


class Annotation_Json(models.Model):
    id = models.AutoField(primary_key=True)
    task = models.ForeignKey("Tasks", on_delete=models.PROTECT, null=False, blank=False, db_column="task_id",
                             related_name='+')
    annotation_json = models.TextField(default='', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return self.id

    class Meta:
        db_table = "annotation_json"
