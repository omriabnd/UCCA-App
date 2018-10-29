from django.core.management import BaseCommand
from django.db import transaction

from uccaApp.models import Tasks
import json

from uccaApp.serializers import TaskSerializerAnnotator


class Command(BaseCommand):
    help = 'Save one task'

    class RollbackException(Exception):
        pass

    def add_arguments(self, parser):
        parser.add_argument('task_id', type=int, help='ID of task to save')
        parser.add_argument('task_json_file', type=str, help='File with task JDON')

    def handle(self, task_id, task_json_file, *args, **kwargs):
        task = Tasks.objects.get(id=task_id)
        with open(task_json_file, 'r', encoding='utf-8') as json_file:
            task_json = json.load(json_file)

        try:
            self.save_task(task, task_json)
        except Command.RollbackException:
            pass
        self.stdout.write('Done')

    @transaction.atomic
    def save_task(self, task, task_json):
        annotator = TaskSerializerAnnotator()
        annotator.initial_data = task_json
        annotator.save_annotation_task(task)
        raise Command.RollbackException
