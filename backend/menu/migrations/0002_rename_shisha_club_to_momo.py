from django.db import migrations

OLD = '\u0643\u0644\u0648\u0628'        # كلوب
NEW = '\u0645\u0648\u0645\u0648'        # مومو
SHISHA = '\u0634\u064a\u0634\u0629'     # شيشة


def rename(apps, schema_editor):
    """In the shisha category only: replace كلوب with مومو in item names (e.g. 'شيشة كلوب' -> 'شيشة مومو').
    Items in other categories (such as كلوب ساندوتش) are untouched. Safe to run more than once."""
    MenuItem = apps.get_model('menu', 'MenuItem')
    for item in MenuItem.objects.filter(category__name__contains=SHISHA, name__contains=OLD):
        item.name = item.name.replace(OLD, NEW)
        item.save(update_fields=['name'])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [('menu', '0001_initial')]
    operations = [migrations.RunPython(rename, noop)]
