# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2019-04-02 08:29
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uccaApp', '0010_passages_text_direction'),
    ]

    operations = [
        migrations.AddField(
            model_name='layers',
            name='disable_remotes',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='layers',
            name='require_all_tokens_covered',
            field=models.BooleanField(default=False),
        ),
    ]
