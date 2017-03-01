# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from datetime import datetime
from uccaApp.models import Tabs, Constants, Roles
from django.db import models
from django.contrib.auth.models import User, Group


class Users(models.Model):
    id = models.AutoField(primary_key=True)

    user_auth = models.OneToOneField(User,null=False, related_name="base_user", default=1, on_delete=models.CASCADE,unique=True)
    # user_group = models.OneToOneField(Group,null=False, related_name="base_user", default=1, on_delete=models.CASCADE,unique=True)

    first_name = models.CharField(max_length=100, default='')
    last_name = models.CharField(max_length=100, default='')
    email = models.EmailField(max_length=100,unique=True)
    organization = models.CharField(max_length=Constants.ORGANIZATION_MAX_LENGTH)
    affiliation = models.CharField(max_length=Constants.ORGANIZATION_MAX_LENGTH)
    role = models.ForeignKey(Roles,max_length=256,db_column="role")

    created_by = models.ForeignKey(User,null=True,blank=True, related_name="created_by_user",db_column="created_by")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)

    def __unicode__(self):
        return self.first_name

    class Meta:
        db_table="users"

    def set_group(self,user_id,new_role_name):
        # remove users permissions
        User.objects.get(pk=user_id).groups.clear()
        # grant new group to user
        Group.objects.get(name=new_role_name).user_set.add(User.objects.get(pk=user_id))