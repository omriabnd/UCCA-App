from django.shortcuts import render
from django.contrib.auth.models import User, Group
from rest_framework import generics
from uccaApp.models import Users,Categories,Layers,Projects,Tasks
from uccaApp.serializers import UsersSerializer, GroupSerializer, LayerSerializer, CategorySerializer
from uccaApp import services
from .SourcesViewSet import *
from .PassagesViewSet import *
from .LoginViewSet import *
from .CategoryViewSet import *
from .UsersViewSet import *
from .SignupViewSet import *
from .ForgotPasswordViewSet import *
from .LayersViewSet import *
from .TasksViewSet import *
from .ProjectesViewSet import *
from .UsersProjectsViewSet import *
from .PassagesProjectsViewSet import *
from .UsersTasksViewSet import *
from .PassagesTasksViewSet import *
from .AnnotatorTasksViewSet import *




