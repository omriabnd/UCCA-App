from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.CharField(label=_("email"))

    def validate(self, attrs):
        email = attrs.get('email')

        if email:
            user = User.objects.get(email=email)

            if user:
                if not user.is_active:
                    msg = _('User account is disabled.')
                    raise serializers.ValidationError(msg)
            else:
                msg = _('No Such Email.')
                raise serializers.ValidationError(msg)
        else:
            msg = _('Must include "email".')
            raise serializers.ValidationError(msg)

        attrs['user'] = user
        return attrs
