"""ucaa URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from django.conf.urls import url, include
from rest_auth.views import LogoutView
from rest_framework import routers
from rest_framework.mixins import UpdateModelMixin

from uccaApp import views

API_VERSION = '1'

router = routers.DefaultRouter()
router.register(r'api/v'+API_VERSION+'/signup', views.SignupViewSet)
router.register(r'api/v'+API_VERSION+'/users', views.UsersViewSet)

router.register(r'api/v'+API_VERSION+'/layers', views.LayerViewSet)
router.register(r'api/v'+API_VERSION+'/categories', views.CategoryViewSet)
router.register(r'api/v'+API_VERSION+'/sources', views.SourceViewSet)
router.register(r'api/v'+API_VERSION+'/passages', views.PassagesViewSet)
router.register(r'api/v'+API_VERSION+'/tasks', views.TasksViewSet)
router.register(r'api/v'+API_VERSION+'/projects', views.ProjectViewSet)

# Wire up our API using automatic URL routing.
urlpatterns = [
    url(r'^api/v'+API_VERSION+'/login', views.ObtainAuthToken.as_view()),
    url(r'^api/v'+API_VERSION+'/forgot_password', views.ForgotPasswordViewSet.as_view()),
    url(r'^admin/', admin.site.urls),
    url(r'^', include(router.urls)),
    url(r'^api/v'+API_VERSION+'/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/v'+API_VERSION+'/change_password', views.PasswordChangeView.as_view(),name='rest_password_change'),
    url(r'^api/v'+API_VERSION+'/logout', LogoutView.as_view(),name='rest_logout'),
    url(r'^api/v'+API_VERSION+'/users/(?P<user_id>[0-9]+)/projects', views.UsersProjectsViewSet.as_view({'get': 'list'}),name='user_projects'),
    url(r'^api/v'+API_VERSION+'/passages/(?P<passage_id>[0-9]+)/projects', views.PassagesProjectsViewSet.as_view({'get': 'list'}),name='passage_projects'),
    url(r'^api/v'+API_VERSION+'/users/(?P<user_id>[0-9]+)/tasks', views.UsersTasksViewSet.as_view({'get': 'list'}),name='user_tasks'),
    url(r'^api/v'+API_VERSION+'/passages/(?P<passage_id>[0-9]+)/tasks', views.PassagesTasksViewSet.as_view({'get': 'list'}),name='passage_tasks'),
    url(r'^api/v'+API_VERSION+'/user_tasks/(?P<pk>[0-9]+)$', views.AnnotatorTasksViewSet.as_view({'get': 'retrieve'}),name='user_tasks'),
    url(r'^api/v'+API_VERSION+'/user_tasks/(?P<pk>[0-9]+)/(?P<save_type>[A-Za-z]+)$', views.AnnotatorTasksViewSet.as_view({'get': 'retrieve','put': 'update'}),name='save_user_tasks')

]
