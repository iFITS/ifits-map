from django.contrib.auth.models import User


class HookSet(object):

    def get_blog(self, **kwargs):
        username = kwargs.get("nuangua", None)
        print("entering get_blog")
        print(username)
        return User.objects.get(username=username).blog