# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

from rest_framework import status
from rest_framework.exceptions import APIException


class DependencyFailedException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = ('You need to fix object\'s dependencies')
    default_code = 'error'

class CreateDerivedLayerException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ('This Layer must have a parent layer, please provide parnet id')
    default_code = 'error'

class InActiveUserLoginExeption(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = ('Your account has been inactivated')
    default_code = 'error'

class InActiveModelExeption(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = ('the model you tried to asign is not active')
    default_code = 'error'

class SaveTypeDeniedException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = ('The save type is not available')
    default_code = 'error'


class SaveTaskTypeDeniedException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ('You cant save tokenization task with parent task. Only tokenization task can be the root task.')
    default_code = 'error'

class CreateAnnotationTaskDeniedException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ('Annotation task must have a parent task')
    default_code = 'error'

class CreateCoarseningAnnotationTaskDeniedException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ('Annotation task of coarsening layer, cant have a tokenization task as a parent task')
    default_code = 'error'

class CantChangeSubmittedTaskExeption(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = ('Cant change a submitted task')
    default_code = 'error'