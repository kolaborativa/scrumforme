__author__ = 'Anna Cruz'


def install():
    '''
    This is a function to populate role table before use the application
    :return: nothing
    '''
    roles = ['Product Owner', 'Scrum Master', 'Team', 'Guest']
    for role in roles:
        db.role.insert(name=role)
    return ""
