# Copyright (C) 2017 Omri Abend, The Rachel and Selim Benin School of Computer Science and Engineering, The Hebrew University.

__author__ = 'Yarin'
def get_random_user(numOfResults):
    params = {'results': numOfResults}
    r = requests.get('http://api.randomuser.me', params=params)
    users = r.json()
    users_list = {'users ':users['results']}