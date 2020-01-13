from django.core.management import BaseCommand
from django.db import transaction

from uccaApp.models import Tasks
import json

from uccaApp.serializers import TaskSerializerAnnotator


class Command(BaseCommand):
    help = 'Load one task'

    def add_arguments(self, parser):
        parser.add_argument('task_id', type=int, help='ID of task to save')
        parser.add_argument('--no-print', default=False, action='store_true', help='Do not print json')

    def handle(self, task_id, no_print, *args, **kwargs):
        task = Tasks.objects.get(id=task_id)
        serializer = TaskSerializerAnnotator(instance=task)

        data = self.serialize_task(serializer)
        if not no_print:
            print(json.dumps(data, indent=4))

        self.stdout.write('Done')

    def serialize_task(self, serializer):
        data = serializer.data
        return data
