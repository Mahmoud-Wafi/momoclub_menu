"""
أمر إدارة Django لتعبئة قاعدة البيانات ببيانات منيو MOMO CLUB المستخرجة من صور المنيو
"""
from django.core.management.base import BaseCommand
from menu.models import Category, MenuItem, SizeOption


class Command(BaseCommand):
    help = 'تعبئة قاعدة البيانات ببيانات منيو MOMO CLUB'

    def handle(self, *args, **options):
        self.stdout.write('جاري حذف البيانات القديمة...')
        SizeOption.objects.all().delete()
        MenuItem.objects.all().delete()
        Category.objects.all().delete()

        # ========================================
        # 1. مشويات
        # ========================================
        cat_grills = Category.objects.create(name='مشويات', icon='🔥', order=1)

        grills_data = [
            {
                'name': 'كفتة بلدي على الفحم',
                'sizes': [('ربع', 170), ('تلت', 210), ('نص', 325), ('كيلو', 650)],
                'order': 1,
            },
            {
                'name': 'كفتة فراخ على الفحم',
                'sizes': [('ربع', 150), ('تلت', 190), ('نص', 300), ('كيلو', 590)],
                'order': 2,
            },
            {
                'name': 'ريش ضاني على الفحم',
                'sizes': [('ربع', 210), ('تلت', 280), ('نص', 420), ('كيلو', 850)],
                'order': 3,
            },
            {
                'name': 'كباب ضاني على الفحم',
                'sizes': [('ربع', 240), ('تلت', 320), ('نص', 425), ('كيلو', 850)],
                'order': 4,
            },
            {
                'name': 'طرب على الفحم',
                'sizes': [('ربع', 200), ('تلت', 270), ('نص', 400), ('كيلو', 800)],
                'order': 5,
            },
            {
                'name': 'روز بيف على الفحم',
                'sizes': [('ربع', 190), ('تلت', 250), ('نص', 350), ('كيلو', 700)],
                'order': 6,
            },
            {
                'name': 'مشكل مشاوي شمبري',
                'sizes': [('ربع', 200), ('تلت', 260), ('نص', 360), ('كيلو', 700)],
                'order': 7,
            },
            {
                'name': 'ميكس جريل',
                'sizes': [('تلت', 280), ('نص', 400), ('كيلو', 800)],
                'order': 8,
            },
            {
                'name': 'فراخ شيش على الفحم',
                'sizes': [('ربع', 110), ('نص', 170), ('فرخة', 300)],
                'order': 9,
            },
            {
                'name': 'فراخ شواية على الفحم',
                'sizes': [('ربع', 110), ('نص', 170), ('فرخة', 300)],
                'order': 10,
            },
        ]

        for item_data in grills_data:
            item = MenuItem.objects.create(
                category=cat_grills,
                name=item_data['name'],
                has_sizes=True,
                order=item_data['order'],
            )
            for i, (size_name, size_price) in enumerate(item_data['sizes']):
                SizeOption.objects.create(
                    item=item, name=size_name, price=size_price, order=i
                )

        # ========================================
        # 2. طواجن
        # ========================================
        cat_tagines = Category.objects.create(name='طواجن', icon='🍲', order=2)

        tagines_data = [
            ('طاجن لحم بلدي بالخضار', 250, 1),
            ('طاجن لحمة بلدي بالبصل', 250, 2),
            ('وجبة كبسة لحم بلدي', 250, 3),
            ('وجبة كبسة لحم ضاني', 270, 4),
            ('وجبة موزة ضاني', 420, 5),
            ('وجبة مكرونة جارية ضاني', 270, 6),
            ('وجبة مكرونة جارية شمبري', 250, 7),
        ]

        for name, price, order in tagines_data:
            MenuItem.objects.create(
                category=cat_tagines, name=name, price=price, order=order
            )

        # ========================================
        # 3. صواني
        # ========================================
        cat_trays = Category.objects.create(name='صواني', icon='🍱', order=3)

        trays_data = [
            ('صنية MOMO مشكل لحوم', 1950, 1),
            ('صنية العيلة مشكل لحوم', 1000, 2),
        ]

        for name, price, order in trays_data:
            MenuItem.objects.create(
                category=cat_trays, name=name, price=price, order=order
            )

        # ========================================
        # 4. حواوشي
        # ========================================
        cat_hawawshi = Category.objects.create(name='حواوشي', icon='🥙', order=4)

        hawawshi_data = [
            ('حواوشي مومو', 150, 1),
            ('حواوشي مومو وش موتزريلا', 180, 2),
            ('نص رغيف حواوشي مومو', 80, 3),
            ('نص رغيف حواوشي مومو وش موتزريلا', 100, 4),
        ]

        for name, price, order in hawawshi_data:
            MenuItem.objects.create(
                category=cat_hawawshi, name=name, price=price, order=order
            )

        # ========================================
        # 5. بيتزا
        # ========================================
        cat_pizza = Category.objects.create(name='بيتزا', icon='🍕', order=5)

        pizza_data = [
            {
                'name': 'بيتزا مارجريتا',
                'sizes': [('M', 110), ('L', 130)],
                'order': 1,
            },
            {
                'name': 'بيتزا تشيكن رانش',
                'sizes': [('M', 150), ('L', 180)],
                'order': 2,
            },
            {
                'name': 'بيتزا بافلو',
                'sizes': [('M', 150), ('L', 180)],
                'order': 3,
            },
            {
                'name': 'بيتزا تشيكن تكساس',
                'sizes': [('M', 150), ('L', 180)],
                'order': 4,
            },
            {
                'name': 'بيتزا خضار',
                'sizes': [('M', 120), ('L', 150)],
                'order': 5,
            },
            {
                'name': 'بيتزا مشكل لحوم',
                'sizes': [('M', 170), ('L', 200)],
                'order': 6,
            },
            {
                'name': 'بيتزا شريمب (جمبري)',
                'sizes': [('M', 200), ('L', 220)],
                'order': 7,
            },
            {
                'name': 'بيتزا سي فود',
                'sizes': [('M', 220), ('L', 250)],
                'order': 8,
            },
            {
                'name': 'بيتزا MOMO',
                'sizes': [('M', 230), ('L', 260)],
                'order': 9,
            },
            {
                'name': 'بيتزا سجق',
                'sizes': [('M', 170), ('L', 200)],
                'order': 10,
            },
            {
                'name': 'بيتزا بسطرمة',
                'sizes': [('M', 170), ('L', 200)],
                'order': 11,
            },
            {
                'name': 'بيتزا لحم مفروم بلدي',
                'sizes': [('M', 170), ('L', 200)],
                'order': 12,
            },
        ]

        for item_data in pizza_data:
            item = MenuItem.objects.create(
                category=cat_pizza,
                name=item_data['name'],
                has_sizes=True,
                order=item_data['order'],
            )
            for i, (size_name, size_price) in enumerate(item_data['sizes']):
                SizeOption.objects.create(
                    item=item, name=size_name, price=size_price, order=i
                )

        # ========================================
        # 6. باستا
        # ========================================
        cat_pasta = Category.objects.create(name='باستا', icon='🍝', order=6)

        pasta_data = [
            ('جريل تشيكن باستا', 130, 1),
            ('نيكو باستا', 140, 2),
            ('شريمب باستا', 180, 3),
            ('روزيه بافتلو', 160, 4),
            ('ماك اند تشيز', 140, 5),
            ('باستا ماك', 160, 6),
            ('سجق ماك', 170, 7),
            ('سي فود فوتشيني', 200, 8),
        ]

        for name, price, order in pasta_data:
            MenuItem.objects.create(
                category=cat_pasta, name=name, price=price, order=order
            )

        # ========================================
        # 7. كريب
        # ========================================
        cat_crepe = Category.objects.create(name='كريب', icon='🌯', order=7)

        crepe_data = [
            ('كريب ميكس تشيز', 120, 1),
            ('كريب بطاطس تشيز', 120, 2),
            ('كريب فراي', 130, 3),
            ('كريب بيف بيكون', 150, 4),
            ('كريب سي فود', 170, 5),
            ('كريب F16', 190, 6),
        ]

        for name, price, order in crepe_data:
            MenuItem.objects.create(
                category=cat_crepe, name=name, price=price, order=order
            )

        # ========================================
        # 8. ساندوتشات
        # ========================================
        cat_sandwich = Category.objects.create(name='ساندوتشات', icon='🥪', order=8)

        sandwich_data = [
            ('ساندوتش بطاطس سادة', 30, 1),
            ('ساندويش بطاطس موتزريلا طبيعي', 50, 2),
            ('ساندويش بطاطس موتزريلا طبيعي سوري', 80, 3),
            ('كلاسيك برجر', 130, 4),
            ('سماش برجر', 160, 5),
            ('كلوب ساندوتش', 100, 6),
            ('فاهيتا MOMO', 110, 7),
            ('ميكس سي فود ساندوتش', 170, 8),
        ]

        for name, price, order in sandwich_data:
            MenuItem.objects.create(
                category=cat_sandwich, name=name, price=price, order=order
            )

        # ========================================
        # 9. مشروبات (Soda Cocktail)
        # ========================================
        cat_drinks = Category.objects.create(name='مشروبات', icon='🍹', order=9)

        drinks_data = [
            ('موخيتو خوخ', 55, 1),
            ('بينا كولادا ليمون', 50, 2),
            ('بينا كولادا ميكس بيري', 55, 3),
            ('بلوسكاي', 50, 4),
            ('صن شاين', 50, 5),
            ('صن رايز', 50, 6),
            ('كلاسيك موخيتو', 50, 7),
            ('موخيتو بلو بيري', 55, 8),
            ('بيناكولادا باشون فروت', 55, 9),
            ('ليمونادا باشون', 50, 10),
            ('شيري كولا', 50, 11),
            ('موخيتو ريد بول', 100, 12),
            ('صن بلو', 60, 13),
        ]

        for name, price, order in drinks_data:
            MenuItem.objects.create(
                category=cat_drinks, name=name, price=price, order=order
            )

        # ========================================
        # 10. آيس كريم
        # ========================================
        cat_icecream = Category.objects.create(name='آيس كريم', icon='🍨', order=10)

        icecream_data = [
            ('آيس فانيليا', 40, 1),
            ('آيس شوكليت', 40, 2),
            ('آيس مانجا', 40, 3),
            ('آيس فراولة', 40, 4),
            ('آيس مومو', 50, 5),
        ]

        for name, price, order in icecream_data:
            MenuItem.objects.create(
                category=cat_icecream, name=name, price=price, order=order
            )

        # ========================================
        # 11. الإضافات
        # ========================================
        cat_extras = Category.objects.create(name='الإضافات', icon='➕', order=11)

        extras_data = [
            ('طبق أرز بسمتي سادة', 50, 1),
            ('طبق أرز بسمتي مكسرات', 60, 2),
            ('فردة حمام محشي', 180, 3),
            ('شوربة لحمة', 20, 4),
            ('شوربة حمام', 30, 5),
            ('سلطة خضراء', 15, 6),
            ('طحينة', 15, 7),
            ('مخلل', 10, 8),
            ('بابا غنوج', 15, 9),
            ('عيش', 10, 10),
            ('باكت بطاطس سادة', 30, 11),
            ('باكت بطاطس بصوص جبنة', 50, 12),
        ]

        for name, price, order in extras_data:
            MenuItem.objects.create(
                category=cat_extras, name=name, price=price, order=order
            )

        # Summary
        total_categories = Category.objects.count()
        total_items = MenuItem.objects.count()
        total_sizes = SizeOption.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f'✅ تم تعبئة قاعدة البيانات بنجاح!\n'
            f'   📂 الأقسام: {total_categories}\n'
            f'   🍽️ الأصناف: {total_items}\n'
            f'   📏 الأحجام: {total_sizes}'
        ))
