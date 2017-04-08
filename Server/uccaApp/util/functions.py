import datetime

from django.contrib.auth.models import User
from rest_framework.generics import get_object_or_404

from ucca.settings import REGISTRATION_LINK
from uccaApp.models.Log_Action import LogAction
from uccaApp.util.exceptions import InActiveModelExeption
from django.core.mail import send_mail

def Send_Email(email, body, subject=None):
    if subject == None:
        subject = "New message from UCCA web-app"
    message = ""
    from_email = "support.ucca@cs.huji.ac.il"
    recipient_list = [email]
    try:
        user = get_object_or_404(User,email=email)
        header = "<div>Dear "+user.first_name+",</div><br>"
        footer = "<br>Kind regards,<br><br>Omri Abend<br>NLP Lab, The Hebrew University of Jerusalem<br>On behalf of the UCCA team<br>support.ucca@cs.huji.ac.il<br><br><div>All rights reserved to UCCA "+'%d'%(datetime.datetime.now().year)+" ©</div>"
        html = "<!DOCTYPE html><html><head><meta http-equiv='Content-Type'  content='text/html charset=UTF-8' /></head><body>"+header+""+body+""+footer+"</body></html>"
        send_mail(subject, message, from_email, recipient_list,
                  fail_silently=False, auth_user=None, auth_password=None,
                  connection=None, html_message=html)
        print("email: " + email + " ,body: " + body)
    except:
        print("couldnt send mail to " + email)



def send_invite_email(inviterName,toEmail,password):
    body = "<div>"+inviterName+" has invited you to take part in an annotation project<br>\
                carried out through the UCCA web-site.<br>\
                <br>\
                Please complete your registration through this URL:<br>\
                "+REGISTRATION_LINK+"<br>\
                <br>\
                Username: "+toEmail+"<br>\
                Temporary password: "+password+"<br>\
                <br>\
                Please feel free to contact me with any questions.<br>\
            </div>"
    Send_Email(toEmail, body, subject="Welcome to the UCCA web-app")

def send_signup_email(toEmail,password):
    body = "<div>Welcome to the UCCA web-app. Your username and password are:<br>\
                <br>\
                Username: "+toEmail+"<br>\
                Password: "+password+"<br>\
                <br>\
                Please feel free to contact me with any questions.<br>\
            </div>"
    Send_Email(toEmail, body, subject="Welcome to the UCCA web-app")

def send_change_password_email(toEmail,password):
    body = "<div>You have successfully updated your password:<br>\
                <br>\
                Username: "+toEmail+"<br>\
                Password: "+password+"<br>\
                <br>\
                Please feel free to contact me with any questions.<br>\
            </div>"
    Send_Email(toEmail, body, subject="Welcome to the UCCA web-app")


def send_forgot_password_email(toEmail,password):
    body = "<div>You have successfully reset your password:<br>\
                <br>\
                Username: "+toEmail+"<br>\
                Temporary Password: "+password+"<br>\
                <br>\
                Please feel free to contact me with any questions.<br>\
            </div>"
    Send_Email(toEmail, body, subject="Reset UCCA password")


def get_value_or_none(key,dict):
    if dict is None or key is None:
        return None
    if key in dict:
        return dict[key]
    else:
        return None;

def active_obj_or_raise_exeption(obj):
    if obj is not None and obj.is_active == False:
        raise InActiveModelExeption

def has_permissions_to(request,premission_code_name):
    user_id = request.user.id
    user = get_object_or_404(User, pk=user_id)

    if (user.groups.first()):
        group = user.groups.first().name
        has_perm = user.has_perm('uccaApp.' + premission_code_name)
    else:
        group = 'NULL'
        has_perm = False

    print(user.email + '('+ group +')' + ' has permissions to '+premission_code_name,has_perm)

    # if has permition -> save action to log
    if(has_perm == True):
        log_data = ''
        if request.data:
            log_data = str(request.data)
        elif request.parser_context and request.parser_context['kwargs']:
            log_data = str(request.parser_context['kwargs'])
        LogAction(
            user_id = request.user,
            action=premission_code_name,
            data=log_data,
            comment='',
        ).save()

    return has_perm
