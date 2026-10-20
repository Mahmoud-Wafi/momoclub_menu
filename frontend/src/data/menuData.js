/**
 * MOMO CLUB - بيانات المنيو الرسمية الكاملة
 * مستخرجة ومحدثة بدقة من صور منيو مطعم وكافيه MOMO CLUB
 */

const menuData = [
  {
    id: 1,
    name: 'مشويات',
    icon: '🔥',
    items: [
      {
        id: 101, name: 'كفتة بلدي على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 190 }, { name: 'تلت', price: 250 },
          { name: 'نص', price: 370 }, { name: 'كيلو', price: 750 }
        ]
      },
      {
        id: 102, name: 'كفتة فراخ على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 170 }, { name: 'تلت', price: 210 },
          { name: 'نص', price: 330 }, { name: 'كيلو', price: 650 }
        ]
      },
      {
        id: 103, name: 'ريش ضاني على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 260 }, { name: 'تلت', price: 370 },
          { name: 'نص', price: 490 }, { name: 'كيلو', price: 980 }
        ]
      },
      {
        id: 104, name: 'كباب على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 250 }, { name: 'تلت', price: 350 },
          { name: 'نص', price: 480 }, { name: 'كيلو', price: 950 }
        ]
      },
      {
        id: 105, name: 'طرب على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 230 }, { name: 'تلت', price: 300 },
          { name: 'نص', price: 450 }, { name: 'كيلو', price: 900 }
        ]
      },
      {
        id: 106, name: 'روز بيف على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 210 }, { name: 'تلت', price: 270 },
          { name: 'نص', price: 380 }, { name: 'كيلو', price: 800 }
        ]
      },
      {
        id: 107, name: 'مشكل مشاوي شمبري', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 220 }, { name: 'تلت', price: 290 },
          { name: 'نص', price: 390 }, { name: 'كيلو', price: 830 }
        ]
      },
      {
        id: 108, name: 'ميكس جريل', has_sizes: true,
        sizes: [
          { name: 'نص', price: 450 }, { name: 'كيلو', price: 900 }
        ]
      },
      {
        id: 109, name: 'فراخ شيش على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 120 }, { name: 'نص', price: 190 }, { name: 'فرخة كاملة', price: 350 }
        ]
      },
      {
        id: 110, name: 'فراخ شواية على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 120 }, { name: 'نص', price: 190 }, { name: 'فرخة كاملة', price: 350 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'صواني العيلة',
    icon: '👑',
    items: [
      {
        id: 201,
        name: 'صنية العيلة مشكل لحوم',
        description: 'ربع كيلو كفتة، ربع كيلو كباب ضاني، نص فرخة شواية، 2 فردة حمام، 2 ارز بسمتي، 2 شوربة، عيش، 2 مخلل، 2 سلطة خضراء، 2 طحينة، 2 بابا غنوج',
        price: 1100,
        has_sizes: false
      },
      {
        id: 202,
        name: 'صنية MOMO مشكل لحوم',
        description: 'نص كيلو كفتة، نص كيلو كباب ضاني، نص فرخة شواية، 4 فردة حمام، 4 ارز بسمتي، 4 شوربة، عيش، 4 مخلل، 4 سلطة خضراء، 4 طحينة، 4 بابا غنوج',
        price: 2100,
        has_sizes: false
      }
    ]
  },
  {
    id: 3,
    name: 'حواوشي وإضافات',
    icon: '🥩',
    items: [
      { id: 301, name: 'حواوشي مومو بلدي', price: 160, has_sizes: false },
      { id: 302, name: 'حواوشي مومو وش موتزريلا', price: 190, has_sizes: false },
      { id: 303, name: 'نص رغيف حواوشي مومو', price: 90, has_sizes: false },
      { id: 304, name: 'نص رغيف حواوشي وش موتزريلا', price: 100, has_sizes: false },
      { id: 305, name: 'طبق ارز بسمتي فاخر', price: 50, has_sizes: false },
      { id: 306, name: 'فردة حمام محشي فريك / أرز', price: 200, has_sizes: false },
      { id: 307, name: 'شوربة لحمة دسمة', price: 20, has_sizes: false },
      { id: 308, name: 'سلطة خضراء طازجة', price: 15, has_sizes: false },
      { id: 309, name: 'طحينة بيضاء بلدي', price: 15, has_sizes: false },
      { id: 310, name: 'بابا غنوج مدخن', price: 15, has_sizes: false },
      { id: 311, name: 'مخلل بلدي مشكل', price: 10, has_sizes: false },
      { id: 312, name: 'عيش بلدي طازج', price: 10, has_sizes: false }
    ]
  },
  {
    id: 4,
    name: 'بيتزا',
    icon: '🍕',
    items: [
      {
        id: 401, name: 'بيتزا مارجريتا', has_sizes: true,
        description: 'صلصة + ميكس جبن + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 120 }, { name: 'L', price: 140 }]
      },
      {
        id: 402, name: 'بيتزا تشيكن رانش', has_sizes: true,
        description: 'صلصة + فراخ جريل فريش + موتزريلا طبيعي + فلفل الوان + زيتون + صوص الرانش',
        sizes: [{ name: 'M', price: 160 }, { name: 'L', price: 190 }]
      },
      {
        id: 403, name: 'بيتزا بافلو', has_sizes: true,
        description: 'صلصة + فراخ جريل فريش + موتزريلا طبيعي + فلفل الوان + زيتون + صوص البافلو',
        sizes: [{ name: 'M', price: 160 }, { name: 'L', price: 190 }]
      },
      {
        id: 404, name: 'بيتزا تشيكن تكساس', has_sizes: true,
        description: 'صلصة + فراخ جريل فريش + موتزريلا طبيعي + فلفل الوان + زيتون + صوص التكساس',
        sizes: [{ name: 'M', price: 160 }, { name: 'L', price: 190 }]
      },
      {
        id: 405, name: 'بيتزا خضار', has_sizes: true,
        description: 'صلصة + مشروم + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 130 }, { name: 'L', price: 160 }]
      },
      {
        id: 406, name: 'بيتزا مشكل لحوم', has_sizes: true,
        description: 'صلصة + مفروم بلدي + سجق بلدي + ببيروني + هوت دوج + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 190 }, { name: 'L', price: 220 }]
      },
      {
        id: 407, name: 'بيتزا شرمب (جمبري)', has_sizes: true,
        description: 'صلصة + جمبري فريش + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 210 }, { name: 'L', price: 240 }]
      },
      {
        id: 408, name: 'بيتزا سي فود', has_sizes: true,
        description: 'صلصة + جمبري فريش + كابوريا + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 230 }, { name: 'L', price: 260 }]
      },
      {
        id: 409, name: 'بيتزا MOMO المميزة', has_sizes: true,
        description: 'صلصة + ربع مفروم بلدي + ربع سجق بلدي + ربع فراخ جريل فريش + ربع ميكس جبن + هوت دوج + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 240 }, { name: 'L', price: 270 }]
      },
      {
        id: 410, name: 'بيتزا سجق بلدي', has_sizes: true,
        description: 'صلصة + سجق بلدي + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 180 }, { name: 'L', price: 210 }]
      },
      {
        id: 411, name: 'بيتزا بسطرمة', has_sizes: true,
        description: 'صلصة + بسطرمة + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 180 }, { name: 'L', price: 210 }]
      },
      {
        id: 412, name: 'بيتزا لحم مفروم بلدي', has_sizes: true,
        description: 'صلصة + لحم مفروم بلدي + موتزريلا طبيعي + فلفل الوان + زيتون',
        sizes: [{ name: 'M', price: 180 }, { name: 'L', price: 210 }]
      }
    ]
  },
  {
    id: 5,
    name: 'باستا',
    icon: '🍝',
    items: [
      {
        id: 501, name: 'تشيكن باستا جريل', price: 140, has_sizes: false,
        description: 'فراخ جريل فريش + بصل + فلفل الوان + مكرونة وايت صوص + جبنة موتزريلا طبيعي + كريمة'
      },
      {
        id: 502, name: 'نجرسكو', price: 150, has_sizes: false,
        description: 'مكرونة + مشروم + فراخ جريل فريش + بصل + فلفل الوان + وايت صوص + جبنة موتزريلا خام + كريمة'
      },
      {
        id: 503, name: 'شرمب باستا (جمبري)', price: 180, has_sizes: false,
        description: 'مكرونة + جمبري + فلفل الوان + بصل + وايت صوص + جبنة موتزريلا طبيعي + كريمة'
      },
      {
        id: 504, name: 'روزيتو به بافلو', price: 170, has_sizes: false,
        description: 'مكرونة + لحمة مفروم بلدي + ببيروني + بصل + فلفل الوان + وايت صوص + جبنة موتزريلا طبيعي + كريمة'
      },
      {
        id: 505, name: 'ماك اند تشيز', price: 150, has_sizes: false,
        description: 'مكرونة + ميكس جبن + وايت صوص + فلفل الوان + بصل + موتزريلا طبيعي + كريمة'
      },
      {
        id: 506, name: 'كريسبي باستا', price: 170, has_sizes: false,
        description: 'مكرونة + فراخ كريسبي فريش + وايت صوص + فلفل الوان + بصل + جبنة موتزريلا طبيعي + كريمة'
      },
      {
        id: 507, name: 'سجق باستا', price: 180, has_sizes: false,
        description: 'مكرونة + سجق + وايت صوص + فلفل الوان + بصل + جبنة موتزريلا طبيعي + كريمة'
      },
      {
        id: 508, name: 'سي فود باستا', price: 210, has_sizes: false,
        description: 'صلصة + جمبري فريش + كابوريا + موتزريلا طبيعي + فلفل الوان + زيتون'
      }
    ]
  },
  {
    id: 6,
    name: 'كريب',
    icon: '🌯',
    items: [
      { id: 601, name: 'كريب ميكس تشيز', price: 130, has_sizes: false, description: 'موتزريلا طبيعي + ميكس جبن + فلفل الوان + صوصات' },
      { id: 602, name: 'كريب بطاطس تشيز', price: 130, has_sizes: false, description: 'موتزريلا طبيعي + بطاطس + فلفل الوان + صوصات' },
      { id: 603, name: 'كريب فراي كريسبي', price: 140, has_sizes: false, description: 'موتزريلا طبيعي + فراخ كريسبي فريش + فلفل الوان + صوصات' },
      { id: 604, name: 'كريب بيف بيكون', price: 160, has_sizes: false, description: 'موتزريلا طبيعي + لحمة مفرومة بلدي + فلفل الوان + صوصات' },
      { id: 605, name: 'كريب سي فود', price: 180, has_sizes: false, description: 'موتزريلا طبيعي + جمبري + كاليماري + كابوريا + فلفل الوان + صوصات' },
      { id: 606, name: 'كريب F16 المميز', price: 200, has_sizes: false, description: 'موتزريلا طبيعي + فراخ جريل فريش + فراخ كريسبي + هوت دوج + فلفل الوان + صوصات' }
    ]
  },
  {
    id: 7,
    name: 'ساندوتشات وبرجر',
    icon: '🍔',
    items: [
      { id: 701, name: 'ساندوتش بطاطس ساده', price: 30, has_sizes: false },
      { id: 702, name: 'ساندوتش بطاطس موتزريلا فرنساوي', price: 50, has_sizes: false },
      { id: 703, name: 'ساندوتش بطاطس سوري', price: 50, has_sizes: false },
      { id: 704, name: 'ساندوتش بطاطس موتزريلا سوري', price: 80, has_sizes: false },
      {
        id: 705, name: 'كلاسيك برجر لحم بلدي', price: 150, has_sizes: false,
        description: 'عيش كايزر + قطعة لحم بلدي + قطعة جبنة + خس + طماطم + صوصات'
      },
      {
        id: 706, name: 'سماش برجر دابل بلدي', price: 180, has_sizes: false,
        description: 'عيش كايزر + قطعتين لحم بلدي + قطعة جبنة + خس + طماطم + صوصات'
      },
      {
        id: 707, name: 'كلوب ساندوتش كريسبي', price: 110, has_sizes: false,
        description: 'عيش فرنساوي + فراخ كريسبي فريش + خس + طماطم + صوصات'
      },
      {
        id: 708, name: 'فاهيتا MOMO سوري', price: 120, has_sizes: false,
        description: 'عيش سوري + فراخ جريل فريش + طماطم + بصل + فلفل الوان + صوصات + موتزريلا طبيعي'
      },
      {
        id: 709, name: 'ميكس سي فود فرنساوي', price: 180, has_sizes: false,
        description: 'عيش فرنساوي + جمبري + كاليماري + كابوريا + فلفل الوان + صوصات'
      },
      { id: 710, name: 'باكت بطاطس ساده', price: 30, has_sizes: false },
      { id: 711, name: 'باكت بطاطس كبير', price: 50, has_sizes: false },
      { id: 712, name: 'باكت بطاطس بصوص جبنة', price: 50, has_sizes: false }
    ]
  },
  {
    id: 8,
    name: 'صودا كوكتيل وأيس كريم',
    icon: '🍹',
    items: [
      { id: 801, name: 'موخيتو خوخ', price: 83, has_sizes: false },
      { id: 802, name: 'بينا كولادا ليمون', price: 83, has_sizes: false },
      { id: 803, name: 'بينا كولادا ميكس بيري', price: 83, has_sizes: false },
      { id: 804, name: 'بلو سكاي', price: 83, has_sizes: false },
      { id: 805, name: 'مخيتو جوافة', price: 83, has_sizes: false },
      { id: 806, name: 'مخيتو باشون فروت', price: 83, has_sizes: false },
      { id: 807, name: 'صن شاين', price: 64, has_sizes: false },
      { id: 808, name: 'صن رايز', price: 64, has_sizes: false },
      { id: 809, name: 'كلاسيك موخيتو', price: 70, has_sizes: false },
      { id: 810, name: 'موخيتو بلو بيري', price: 83, has_sizes: false },
      { id: 811, name: 'بيناكولادا باشون فروت', price: 83, has_sizes: false },
      { id: 812, name: 'ليمونادا باشون', price: 78, has_sizes: false },
      { id: 813, name: 'شري كولا', price: 64, has_sizes: false },
      { id: 814, name: 'موخيتو ريدبول', price: 115, has_sizes: false },
      { id: 815, name: 'صن بلو', price: 64, has_sizes: false },
      { id: 816, name: 'ايس كريم مومو الخاص', price: 65, has_sizes: false },
      { id: 817, name: 'ايس كريم فانيليا', price: 50, has_sizes: false },
      { id: 818, name: 'ايس كريم شوكليت', price: 50, has_sizes: false },
      { id: 819, name: 'ايس كريم مانجا', price: 50, has_sizes: false },
      { id: 820, name: 'ايس كريم فراولة', price: 50, has_sizes: false },
      { id: 821, name: 'ايس كريم أوريو', price: 65, has_sizes: false }
    ]
  },
  {
    id: 9,
    name: 'عصائر فريش وسموزي وميلك شيك',
    icon: '🥭',
    items: [
      { id: 901, name: 'عصير مانجو فريش', price: 78, has_sizes: false },
      { id: 902, name: 'عصير فراولة فريش', price: 68, has_sizes: false },
      { id: 903, name: 'عصير جوافة فريش', price: 68, has_sizes: false },
      { id: 904, name: 'عصير موز باللبن', price: 63, has_sizes: false },
      { id: 905, name: 'عصير برتقال فريش', price: 68, has_sizes: false },
      { id: 906, name: 'عصير ليمون فريش', price: 54, has_sizes: false },
      { id: 907, name: 'عصير ليمون نعناع', price: 59, has_sizes: false },
      { id: 908, name: 'عصير بطيخ فريش', price: 68, has_sizes: false },
      { id: 909, name: 'عصير تمر مكسرات', price: 87, has_sizes: false },
      { id: 910, name: 'عصير أفوكادو مكسرات', price: 120, has_sizes: false },
      { id: 911, name: 'عصير كنتلوب فريش', price: 68, has_sizes: false },
      { id: 912, name: 'عصير مانجو كيوي', price: 94, has_sizes: false },
      { id: 913, name: 'ميكس MOMO المميز', price: 89, has_sizes: false },
      { id: 914, name: 'عناب مثلج', price: 54, has_sizes: false },
      { id: 915, name: 'عصير رمان فريش', price: 68, has_sizes: false },
      { id: 916, name: 'سموزي ليمون نعناع', price: 54, has_sizes: false },
      { id: 917, name: 'سموزي فراولة', price: 74, has_sizes: false },
      { id: 918, name: 'سموزي مانجو', price: 74, has_sizes: false },
      { id: 919, name: 'سموزي ميكس بيري', price: 74, has_sizes: false },
      { id: 920, name: 'سموزي خوخ', price: 74, has_sizes: false },
      { id: 921, name: 'سموزي بطيخ', price: 74, has_sizes: false },
      { id: 922, name: 'سموزي بلوبيري', price: 74, has_sizes: false },
      { id: 923, name: 'سموزي باشون فروت', price: 74, has_sizes: false },
      { id: 924, name: 'سموزي جوافة', price: 74, has_sizes: false },
      { id: 925, name: 'ميلك شيك جوافة', price: 78, has_sizes: false },
      { id: 926, name: 'ميلك شيك بلوبيري', price: 78, has_sizes: false },
      { id: 927, name: 'ميلك شيك باشون فروت', price: 78, has_sizes: false },
      { id: 928, name: 'ميلك شيك مانجو', price: 83, has_sizes: false },
      { id: 929, name: 'ميلك شيك فانيليا', price: 78, has_sizes: false },
      { id: 930, name: 'ميلك شيك شوكليت', price: 78, has_sizes: false },
      { id: 931, name: 'ميلك شيك أوريو', price: 83, has_sizes: false },
      { id: 932, name: 'ميلك شيك لوتس', price: 78, has_sizes: false },
      { id: 933, name: 'ميلك شيك كراميل', price: 78, has_sizes: false },
      { id: 934, name: 'ميلك شيك فستق', price: 83, has_sizes: false },
      { id: 935, name: 'ميلك شيك فراولة', price: 83, has_sizes: false }
    ]
  },
  {
    id: 10,
    name: 'قهوة باردة وفرابيه وزبادي',
    icon: '🧊',
    items: [
      { id: 1001, name: 'ايس لاتيه بطيخ', price: 73, has_sizes: false },
      { id: 1002, name: 'ايس لاتيه كلاسيك', price: 68, has_sizes: false },
      { id: 1003, name: 'ايس كوفي مثلج', price: 80, has_sizes: false },
      { id: 1004, name: 'ايس موكا', price: 73, has_sizes: false },
      { id: 1005, name: 'ريدبول كوفي انرجي', price: 120, has_sizes: false },
      { id: 1006, name: 'ايس كراميل ماكياتو', price: 73, has_sizes: false },
      { id: 1007, name: 'ايس اسبانش لاتيه', price: 85, has_sizes: false },
      { id: 1008, name: 'فرابيه نوتيلا', price: 78, has_sizes: false },
      { id: 1009, name: 'فرابيه لوتس', price: 78, has_sizes: false },
      { id: 1010, name: 'فرابيه كيندر', price: 82, has_sizes: false },
      { id: 1011, name: 'فرابيه بيستاشيو (فستق)', price: 82, has_sizes: false },
      { id: 1012, name: 'فرابيه أوريو', price: 82, has_sizes: false },
      { id: 1013, name: 'فرابيه كلاسيك', price: 68, has_sizes: false },
      { id: 1014, name: 'فرابيه كراميل', price: 78, has_sizes: false },
      { id: 1015, name: 'فرابيه شوكليت', price: 78, has_sizes: false },
      { id: 1016, name: 'فرابيه كوفي', price: 82, has_sizes: false },
      { id: 1017, name: 'زبادي سادة', price: 54, has_sizes: false },
      { id: 1018, name: 'زبادي عسل نحل', price: 59, has_sizes: false },
      { id: 1019, name: 'زبادي عسل ومكسرات', price: 73, has_sizes: false },
      { id: 1020, name: 'زبادي فواكه طازجة', price: 78, has_sizes: false },
      { id: 1021, name: 'زبادي MOMO المميز', price: 83, has_sizes: false }
    ]
  },
  {
    id: 11,
    name: 'مشروبات ساخنة وسحلب',
    icon: '☕',
    items: [
      { id: 1101, name: 'قهوة بندق', price: 58, has_sizes: false },
      { id: 1102, name: 'قهوة تركي سادة', price: 44, has_sizes: false },
      { id: 1103, name: 'قهوة تركي محوج', price: 49, has_sizes: false },
      { id: 1104, name: 'قهوة تركي دابل', price: 49, has_sizes: false },
      { id: 1105, name: 'قهوة فرنساوي بالحليب', price: 58, has_sizes: false },
      { id: 1106, name: 'قهوة نوتيلا فرنساوي', price: 67, has_sizes: false },
      { id: 1107, name: 'اسبريسو سنجل', price: 57, has_sizes: false },
      { id: 1108, name: 'اسبريسو دابل', price: 63, has_sizes: false },
      { id: 1109, name: 'اسبريسو ميكاتو', price: 72, has_sizes: false },
      { id: 1110, name: 'كورتادو', price: 68, has_sizes: false },
      { id: 1111, name: 'كابتشينو إيطالي', price: 78, has_sizes: false },
      { id: 1112, name: 'لاتيه ساخن', price: 68, has_sizes: false },
      { id: 1113, name: 'موكا ساخنة', price: 72, has_sizes: false },
      { id: 1114, name: 'كراميل ميكاتو', price: 72, has_sizes: false },
      { id: 1115, name: 'نسكافيه كلاسيك', price: 72, has_sizes: false },
      { id: 1116, name: 'هوت شوكليت', price: 74, has_sizes: false },
      { id: 1117, name: 'هوت شوكليت بندق', price: 79, has_sizes: false },
      { id: 1118, name: 'هوت شوكلت نوتيلا', price: 78, has_sizes: false },
      { id: 1119, name: 'هوت لوتس', price: 74, has_sizes: false },
      { id: 1120, name: 'هوت أوريو', price: 78, has_sizes: false },
      { id: 1121, name: 'سحلب سادة', price: 59, has_sizes: false },
      { id: 1122, name: 'سحلب كراميل', price: 68, has_sizes: false },
      { id: 1123, name: 'سحلب لوتس', price: 68, has_sizes: false },
      { id: 1124, name: 'سحلب نوتيلا', price: 68, has_sizes: false },
      { id: 1125, name: 'سحلب مكسرات فاخرة', price: 76, has_sizes: false },
      { id: 1126, name: 'سحلب فواكه طازجة', price: 76, has_sizes: false },
      { id: 1127, name: 'سحلب MOMO الملكي', price: 82, has_sizes: false }
    ]
  },
  {
    id: 12,
    name: 'حلويات ووافل وبان كيك',
    icon: '🧇',
    items: [
      { id: 1201, name: 'أم علي مكسرات', price: 79, has_sizes: false },
      { id: 1202, name: 'أم علي سادة', price: 57, has_sizes: false },
      { id: 1203, name: 'أم علي فواكه', price: 89, has_sizes: false },
      { id: 1204, name: 'أم علي نوتيلا', price: 68, has_sizes: false },
      { id: 1205, name: 'مولتن كيك شكولاتة غنية', price: 90, has_sizes: false },
      { id: 1206, name: 'مولتن كيك مع بولة أيس كريم', price: 95, has_sizes: false },
      { id: 1207, name: 'تشيز كيك نيويورك', price: 85, has_sizes: false },
      { id: 1208, name: 'شوكليت كيك فاخرة', price: 85, has_sizes: false },
      { id: 1209, name: 'براونيز فدج شكولاتة', price: 75, has_sizes: false },
      { id: 1210, name: 'أرز باللبن سادة', price: 60, has_sizes: false },
      { id: 1211, name: 'أرز باللبن مكسرات', price: 80, has_sizes: false },
      { id: 1212, name: 'فروت سالات MOMO', price: 88, has_sizes: false },
      { id: 1213, name: 'طبق فاكهة مشكل كبير', price: 190, has_sizes: false },
      { id: 1214, name: 'بان كيك عسل وزبدة', price: 73, has_sizes: false },
      { id: 1215, name: 'بان كيك ميكس (نوتيلا - لوتس - شوكليت - فستق)', price: 78, has_sizes: false },
      { id: 1216, name: 'وافل فواكه طازجة', price: 90, has_sizes: false },
      { id: 1217, name: 'وافل نوتيلا بلجيكي', price: 68, has_sizes: false },
      { id: 1218, name: 'وافل زبدة اللوتس', price: 68, has_sizes: false },
      { id: 1219, name: 'وافل كيندر شوكليت', price: 68, has_sizes: false },
      { id: 1220, name: 'وافل بيستاشيو (فستق)', price: 73, has_sizes: false },
      { id: 1221, name: 'وافل وايت شوكليت', price: 68, has_sizes: false },
      { id: 1222, name: 'وافل ميكس صوصات فاخرة', price: 78, has_sizes: false }
    ]
  },
  {
    id: 13,
    name: 'شيشة',
    icon: '💨',
    items: [
      { id: 1301, name: 'معسل حناوي', price: 25, has_sizes: false },
      { id: 1302, name: 'معسل قص', price: 25, has_sizes: false },
      { id: 1303, name: 'معسل سلوم', price: 25, has_sizes: false },
      { id: 1304, name: 'معسل زغلول', price: 30, has_sizes: false },
      { id: 1305, name: 'معسل اسبشيال', price: 35, has_sizes: false },
      { id: 1306, name: 'شيشة كلوب (تفاح فاخر)', price: 120, has_sizes: false },
      { id: 1307, name: 'شيشة كلوب (ليمون نعناع)', price: 120, has_sizes: false },
      { id: 1308, name: 'شيشة كلوب (علكة / علكة نعناع)', price: 120, has_sizes: false },
      { id: 1309, name: 'شيشة كلوب (بلوبيري منعش)', price: 120, has_sizes: false },
      { id: 1310, name: 'شيشة كلوب (لووف 66 Love)', price: 120, has_sizes: false },
      { id: 1311, name: 'شيشة كلوب (خوخ / كنتلوب / بطيخ)', price: 120, has_sizes: false },
      { id: 1312, name: 'شيشة كلوب (ميجا بيري / مانجا كيوي)', price: 120, has_sizes: false },
      { id: 1313, name: 'شيشة كلوب (أوشن Ocean)', price: 120, has_sizes: false },
      { id: 1314, name: 'شيشة اسبشيال MOMO', price: 130, has_sizes: false },
      { id: 1315, name: 'شيشة بيركس فاخرة', price: 130, has_sizes: false },
      { id: 1316, name: 'شيشة إيمي (Amy Shisha)', price: 140, has_sizes: false }
    ]
  }
];

export default menuData;
