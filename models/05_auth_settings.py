# -*- coding: utf-8 -*-

auth.settings.register_fields = ['first_name', 'last_name', 'email', 'password']
auth.settings.register_next= URL('check_your_email')
auth.settings.login_next = URL('projects')

def __afterVerify(form):
    """Function that creates a person
    """
    name = '%s %s' % (form.first_name, form.last_name)
    person_id = Person.insert(name=name)
    db.user_relationship.insert(auth_user_id=form.id, person_id=person_id)


def send_email(type_email):
    data = {
            "verify_email" : {'link' : 'http://'+request.env.http_host+URL(r=request,c='default',f='user',args=['verify_email'])+'/%(key)s', 'render_view' : 'verify_email.html'},
            "reset_password" : {'link' : 'http://'+request.env.http_host+URL(r=request,c='default',f='user',args=['reset_password'])+'/%(key)s', 'render_view' : 'reset_password.html'},
            }
    link = data[type_email]["link"]
    context = dict(link=link)

    return response.render(data[type_email]["render_view"], context)

auth.settings.verify_email_onaccept = lambda form: __afterVerify(form)
auth.messages.verify_email = send_email("verify_email")
auth.messages.reset_password = send_email("reset_password")