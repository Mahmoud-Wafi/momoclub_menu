from getpass import getpass

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "ينشئ (أو يحدّث) حساب كاشير: python manage.py create_cashier USERNAME"

    def add_arguments(self, parser):
        parser.add_argument('username')
        parser.add_argument('--password', help='اتركه فارغًا ليُطلب منك إدخاله بأمان')

    def handle(self, *args, **opts):
        password = opts['password'] or getpass('Password: ')
        if len(password) < 6:
            raise CommandError('كلمة المرور قصيرة (6 أحرف على الأقل)')
        user, created = User.objects.get_or_create(username=opts['username'])
        user.set_password(password)
        user.is_staff = False       # الكاشير لا يعدّل المنيو
        user.is_superuser = False
        user.save()
        user.groups.add(Group.objects.get_or_create(name='cashier')[0])
        self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} cashier: {user.username}"))
