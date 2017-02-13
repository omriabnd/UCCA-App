from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.urlpatterns import format_suffix_patterns
from uccaApp import views

urlpatterns = [
    # url(r'^$', views.LayerViewSet.as_view({'get': 'list'})),
    # url(r'(?P<pk>[0-9]+)/$', views.LayerViewSet.as_view({'get': 'list'})),
    # url(r'(?P<pk>[0-9]+)/categories/', views.CategoryViewSet.as_view()),
    # url(r'^(?P<pk>[0-9]+)/categories/(<pk>[0-9]+)/$', views.CategoryViewSet.as_view()),
    # url(r'^/(?P<pk>[0-9]+)/$', views.CategoryViewSet.as_view({'get': 'list'})),
]
# ^users/$ [name='user-list']
# ^ ^users\.(?P<format>[a-z0-9]+)/?$ [name='user-list']
# ^ ^users/(?P<pk>[^/.]+)/$ [name='user-detail']
# ^ ^users/(?P<pk>[^/.]+)\.(?P<format>[a-z0-9]+)/?$ [name='user-detail']
urlpatterns = format_suffix_patterns(urlpatterns)