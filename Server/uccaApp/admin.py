# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from django.contrib import admin

from uccaApp.models import Layers_Categories
from .models import Users,Categories,Layers,Projects,Tasks,Tabs,Sources,Passages

class AdminPanel(admin.ModelAdmin):
    list_display = ["id","first_name","role","email","organization"]
    list_display_links = ["id"]
    list_filter = ["role","organization"]
    search_fields = ["id","name","role","email","organization"]
    list_editable = ["first_name","role","email","organization"]
    class Meta:
        model = Users


class CategoriesPanel(admin.ModelAdmin):
    list_display = ["id","name","description","tooltip","is_default","created_at"]
    list_display_links = ["id"]
    list_filter = ["is_default"]
    search_fields = ["name","description","tooltip"]
    list_editable = ["name","description","tooltip","is_default"]
    class Meta:
        model = Categories


class LayerCategoriesPanel(admin.ModelAdmin):
    list_display = ["id","shortcut_key","was_default","layer_id","category_id"]
    list_display_links = ["id"]
    list_filter = ["shortcut_key","was_default","layer_id","category_id"]
    search_fields = ["shortcut_key","was_default","layer_id","category_id"]
    list_editable = ["shortcut_key","was_default","layer_id","category_id"]
    class Meta:
        model = Layers_Categories

class LayerPanel(admin.ModelAdmin):
    list_display = ["id","name","description","type","tooltip","get_categories"]
    list_display_links = ["id"]
    list_filter = ["name","description","type","tooltip"]
    search_fields = ["id","name","description","type","tooltip"]
    list_editable = ["name","description","type","tooltip"]
    class Meta:
        model = Layers

    def get_categories(self, obj):
        return " ; ".join([c.category_id.name for c in list(Layers_Categories.objects.all().filter(layer_id=obj.pk)) ])

class ProjectPanel(admin.ModelAdmin):
    list_display = ["id","name","description","tooltip","is_active"]
    list_display_links = ["id"]
    list_filter = ["id","name","description","tooltip","is_active"]
    search_fields = ["id","name","description","tooltip","layer","is_active"]
    list_editable = ["name","description","tooltip","is_active"]
    class Meta:
        model = Projects

class TaskPanel(admin.ModelAdmin):
    list_display = ["id","status"]
    list_display_links = ["id"]
    list_filter = ["id"]
    search_fields = ["id"]
    list_editable = ["status"]
    class Meta:
        model = Tasks

# admin.site.register(Users, AdminPanel)
admin.site.register(Categories,CategoriesPanel)
admin.site.register(Layers,LayerPanel)
admin.site.register(Layers_Categories,LayerCategoriesPanel)
admin.site.register(Projects,ProjectPanel)
admin.site.register(Tasks,TaskPanel)
admin.site.register(Tabs)


admin.site.register(Sources)
admin.site.register(Passages)
