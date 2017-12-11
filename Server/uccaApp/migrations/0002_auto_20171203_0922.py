# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-12-03 09:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uccaApp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='annotation_units',
            name='cluster',
            field=models.CharField(default='', max_length=100),
        ),
        migrations.AddField(
            model_name='passages',
            name='external_id',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='annotation_units',
            name='gui_status',
            field=models.CharField(choices=[('HIDDEN', 'Hidden'), ('OPEN', 'Open'), ('COLLAPSE', 'Collapse')], max_length=50),
        ),
        migrations.AlterField(
            model_name='annotation_units',
            name='type',
            field=models.CharField(choices=[('IMPLICIT', 'REGULAR'), ('REGULAR', 'REGULAR')], max_length=50),
        ),
        migrations.AlterField(
            model_name='layers',
            name='type',
            field=models.CharField(choices=[('EXTENSION', 'Extension'), ('ROOT', 'Root'), ('COARSENING', 'Coarsening'), ('REFINEMENT', 'Refinement')], default=1, max_length=50),
        ),
        migrations.AlterField(
            model_name='layers_categories_restrictions',
            name='resriction_type',
            field=models.CharField(choices=[('FORBID_ANY_CHILD', 'forbid any child'), ('FORBID_CHILD', 'forbid child'), ('REQUIRE_SIBLING', 'require sibling'), ('FORBID_SIBILIMG', 'forbid sibilimg'), ('REQUIRE_CHILD', 'require child')], max_length=256),
        ),
        migrations.AlterField(
            model_name='logaction',
            name='data',
            field=models.TextField(default=''),
        ),
        migrations.AlterField(
            model_name='roles',
            name='name',
            field=models.CharField(choices=[('ADMIN', 'Admin'), ('GUEST', 'Guest'), ('ANNOTATOR', 'Annotator'), ('PROJECT_MANAGER', 'Project Manager')], max_length=50),
        ),
        migrations.AlterField(
            model_name='tabs',
            name='name',
            field=models.CharField(choices=[('PASSAGES', 'Passages'), ('LAYERS', 'Layers'), ('USERS', 'Users'), ('PROJECTS', 'Projects'), ('TASKS', 'Tasks'), ('SOURCES', 'Sources')], max_length=50),
        ),
        migrations.AlterField(
            model_name='tasks',
            name='status',
            field=models.CharField(choices=[('NOT_STARTED', 'NOT_STARTED'), ('REJECTED', 'REJECTED'), ('SUBMITTED', 'SUBMITTED'), ('ONGOING', 'ONGOING')], max_length=256),
        ),
        migrations.AlterField(
            model_name='tasks',
            name='type',
            field=models.CharField(choices=[('ANNOTATION', 'annotation'), ('REVIEW', 'review'), ('TOKENIZATION', 'Tokenization')], db_column='task_type', default=1, max_length=256),
        ),
        migrations.AlterField(
            model_name='tasks',
            name='user_comment',
            field=models.CharField(blank=True, default='', max_length=1000),
        ),
    ]