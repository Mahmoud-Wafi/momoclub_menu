/**
 * MOMO CLUB - بيانات المنيو المستخرجة من صور منيو المطعم
 * يُستخدم كـ fallback في حالة عدم توفر الـ API
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
          { name: 'ربع', price: 170 }, { name: 'تلت', price: 210 },
          { name: 'نص', price: 325 }, { name: 'كيلو', price: 650 }
        ]
      },
      {
        id: 102, name: 'كفتة فراخ على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 150 }, { name: 'تلت', price: 190 },
          { name: 'نص', price: 300 }, { name: 'كيلو', price: 590 }
        ]
      },
      {
        id: 103, name: 'ريش ضاني على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 210 }, { name: 'تلت', price: 280 },
          { name: 'نص', price: 420 }, { name: 'كيلو', price: 850 }
        ]
      },
      {
        id: 104, name: 'كباب ضاني على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 240 }, { name: 'تلت', price: 320 },
          { name: 'نص', price: 425 }, { name: 'كيلو', price: 850 }
        ]
      },
      {
        id: 105, name: 'طرب على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 200 }, { name: 'تلت', price: 270 },
          { name: 'نص', price: 400 }, { name: 'كيلو', price: 800 }
        ]
      },
      {
        id: 106, name: 'روز بيف على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 190 }, { name: 'تلت', price: 250 },
          { name: 'نص', price: 350 }, { name: 'كيلو', price: 700 }
        ]
      },
      {
        id: 107, name: 'مشكل مشاوي شمبري', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 200 }, { name: 'تلت', price: 260 },
          { name: 'نص', price: 360 }, { name: 'كيلو', price: 700 }
        ]
      },
      {
        id: 108, name: 'ميكس جريل', has_sizes: true,
        sizes: [
          { name: 'تلت', price: 280 }, { name: 'نص', price: 400 },
          { name: 'كيلو', price: 800 }
        ]
      },
      {
        id: 109, name: 'فراخ شيش على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 110 }, { name: 'نص', price: 170 },
          { name: 'فرخة', price: 300 }
        ]
      },
      {
        id: 110, name: 'فراخ شواية على الفحم', has_sizes: true,
        sizes: [
          { name: 'ربع', price: 110 }, { name: 'نص', price: 170 },
          { name: 'فرخة', price: 300 }
        ]
      },
    ]
  },
  {
    id: 2,
    name: 'طواجن',
    icon: '🍲',
    items: [
      { id: 201, name: 'طاجن لحم بلدي بالخضار', price: 250, has_sizes: false, sizes: [] },
      { id: 202, name: 'طاجن لحمة بلدي بالبصل', price: 250, has_sizes: false, sizes: [] },
      { id: 203, name: 'وجبة كبسة لحم بلدي', price: 250, has_sizes: false, sizes: [] },
      { id: 204, name: 'وجبة كبسة لحم ضاني', price: 270, has_sizes: false, sizes: [] },
      { id: 205, name: 'وجبة موزة ضاني', price: 420, has_sizes: false, sizes: [] },
      { id: 206, name: 'وجبة مكرونة جارية ضاني', price: 270, has_sizes: false, sizes: [] },
      { id: 207, name: 'وجبة مكرونة جارية شمبري', price: 250, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 3,
    name: 'صواني',
    icon: '🍱',
    items: [
      { id: 301, name: 'صنية MOMO مشكل لحوم', price: 1950, has_sizes: false, sizes: [] },
      { id: 302, name: 'صنية العيلة مشكل لحوم', price: 1000, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 4,
    name: 'حواوشي',
    icon: '🥙',
    items: [
      { id: 401, name: 'حواوشي مومو', price: 150, has_sizes: false, sizes: [] },
      { id: 402, name: 'حواوشي مومو وش موتزريلا', price: 180, has_sizes: false, sizes: [] },
      { id: 403, name: 'نص رغيف حواوشي مومو', price: 80, has_sizes: false, sizes: [] },
      { id: 404, name: 'نص رغيف حواوشي مومو وش موتزريلا', price: 100, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 5,
    name: 'بيتزا',
    icon: '🍕',
    items: [
      {
        id: 501, name: 'بيتزا مارجريتا', has_sizes: true,
        sizes: [{ name: 'M', price: 110 }, { name: 'L', price: 130 }]
      },
      {
        id: 502, name: 'بيتزا تشيكن رانش', has_sizes: true,
        sizes: [{ name: 'M', price: 150 }, { name: 'L', price: 180 }]
      },
      {
        id: 503, name: 'بيتزا بافلو', has_sizes: true,
        sizes: [{ name: 'M', price: 150 }, { name: 'L', price: 180 }]
      },
      {
        id: 504, name: 'بيتزا تشيكن تكساس', has_sizes: true,
        sizes: [{ name: 'M', price: 150 }, { name: 'L', price: 180 }]
      },
      {
        id: 505, name: 'بيتزا خضار', has_sizes: true,
        sizes: [{ name: 'M', price: 120 }, { name: 'L', price: 150 }]
      },
      {
        id: 506, name: 'بيتزا مشكل لحوم', has_sizes: true,
        sizes: [{ name: 'M', price: 170 }, { name: 'L', price: 200 }]
      },
      {
        id: 507, name: 'بيتزا شريمب (جمبري)', has_sizes: true,
        sizes: [{ name: 'M', price: 200 }, { name: 'L', price: 220 }]
      },
      {
        id: 508, name: 'بيتزا سي فود', has_sizes: true,
        sizes: [{ name: 'M', price: 220 }, { name: 'L', price: 250 }]
      },
      {
        id: 509, name: 'بيتزا MOMO', has_sizes: true,
        sizes: [{ name: 'M', price: 230 }, { name: 'L', price: 260 }]
      },
      {
        id: 510, name: 'بيتزا سجق', has_sizes: true,
        sizes: [{ name: 'M', price: 170 }, { name: 'L', price: 200 }]
      },
      {
        id: 511, name: 'بيتزا بسطرمة', has_sizes: true,
        sizes: [{ name: 'M', price: 170 }, { name: 'L', price: 200 }]
      },
      {
        id: 512, name: 'بيتزا لحم مفروم بلدي', has_sizes: true,
        sizes: [{ name: 'M', price: 170 }, { name: 'L', price: 200 }]
      },
    ]
  },
  {
    id: 6,
    name: 'باستا',
    icon: '🍝',
    items: [
      { id: 601, name: 'جريل تشيكن باستا', price: 130, has_sizes: false, sizes: [] },
      { id: 602, name: 'نيكو باستا', price: 140, has_sizes: false, sizes: [] },
      { id: 603, name: 'شريمب باستا', price: 180, has_sizes: false, sizes: [] },
      { id: 604, name: 'روزيه بافتلو', price: 160, has_sizes: false, sizes: [] },
      { id: 605, name: 'ماك اند تشيز', price: 140, has_sizes: false, sizes: [] },
      { id: 606, name: 'باستا ماك', price: 160, has_sizes: false, sizes: [] },
      { id: 607, name: 'سجق ماك', price: 170, has_sizes: false, sizes: [] },
      { id: 608, name: 'سي فود فوتشيني', price: 200, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 7,
    name: 'كريب',
    icon: '🌯',
    items: [
      { id: 701, name: 'كريب ميكس تشيز', price: 120, has_sizes: false, sizes: [] },
      { id: 702, name: 'كريب بطاطس تشيز', price: 120, has_sizes: false, sizes: [] },
      { id: 703, name: 'كريب فراي', price: 130, has_sizes: false, sizes: [] },
      { id: 704, name: 'كريب بيف بيكون', price: 150, has_sizes: false, sizes: [] },
      { id: 705, name: 'كريب سي فود', price: 170, has_sizes: false, sizes: [] },
      { id: 706, name: 'كريب F16', price: 190, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 8,
    name: 'ساندوتشات',
    icon: '🥪',
    items: [
      { id: 801, name: 'ساندوتش بطاطس سادة', price: 30, has_sizes: false, sizes: [] },
      { id: 802, name: 'ساندويش بطاطس موتزريلا طبيعي', price: 50, has_sizes: false, sizes: [] },
      { id: 803, name: 'ساندويش بطاطس موتزريلا طبيعي سوري', price: 80, has_sizes: false, sizes: [] },
      { id: 804, name: 'كلاسيك برجر', price: 130, has_sizes: false, sizes: [] },
      { id: 805, name: 'سماش برجر', price: 160, has_sizes: false, sizes: [] },
      { id: 806, name: 'كلوب ساندوتش', price: 100, has_sizes: false, sizes: [] },
      { id: 807, name: 'فاهيتا MOMO', price: 110, has_sizes: false, sizes: [] },
      { id: 808, name: 'ميكس سي فود ساندوتش', price: 170, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 9,
    name: 'مشروبات',
    icon: '🍹',
    items: [
      { id: 901, name: 'موخيتو خوخ', price: 55, has_sizes: false, sizes: [] },
      { id: 902, name: 'بينا كولادا ليمون', price: 50, has_sizes: false, sizes: [] },
      { id: 903, name: 'بينا كولادا ميكس بيري', price: 55, has_sizes: false, sizes: [] },
      { id: 904, name: 'بلوسكاي', price: 50, has_sizes: false, sizes: [] },
      { id: 905, name: 'صن شاين', price: 50, has_sizes: false, sizes: [] },
      { id: 906, name: 'صن رايز', price: 50, has_sizes: false, sizes: [] },
      { id: 907, name: 'كلاسيك موخيتو', price: 50, has_sizes: false, sizes: [] },
      { id: 908, name: 'موخيتو بلو بيري', price: 55, has_sizes: false, sizes: [] },
      { id: 909, name: 'بيناكولادا باشون فروت', price: 55, has_sizes: false, sizes: [] },
      { id: 910, name: 'ليمونادا باشون', price: 50, has_sizes: false, sizes: [] },
      { id: 911, name: 'شيري كولا', price: 50, has_sizes: false, sizes: [] },
      { id: 912, name: 'موخيتو ريد بول', price: 100, has_sizes: false, sizes: [] },
      { id: 913, name: 'صن بلو', price: 60, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 10,
    name: 'آيس كريم',
    icon: '🍨',
    items: [
      { id: 1001, name: 'آيس فانيليا', price: 40, has_sizes: false, sizes: [] },
      { id: 1002, name: 'آيس شوكليت', price: 40, has_sizes: false, sizes: [] },
      { id: 1003, name: 'آيس مانجا', price: 40, has_sizes: false, sizes: [] },
      { id: 1004, name: 'آيس فراولة', price: 40, has_sizes: false, sizes: [] },
      { id: 1005, name: 'آيس مومو', price: 50, has_sizes: false, sizes: [] },
    ]
  },
  {
    id: 11,
    name: 'الإضافات',
    icon: '➕',
    items: [
      { id: 1101, name: 'طبق أرز بسمتي سادة', price: 50, has_sizes: false, sizes: [] },
      { id: 1102, name: 'طبق أرز بسمتي مكسرات', price: 60, has_sizes: false, sizes: [] },
      { id: 1103, name: 'فردة حمام محشي', price: 180, has_sizes: false, sizes: [] },
      { id: 1104, name: 'شوربة لحمة', price: 20, has_sizes: false, sizes: [] },
      { id: 1105, name: 'شوربة حمام', price: 30, has_sizes: false, sizes: [] },
      { id: 1106, name: 'سلطة خضراء', price: 15, has_sizes: false, sizes: [] },
      { id: 1107, name: 'طحينة', price: 15, has_sizes: false, sizes: [] },
      { id: 1108, name: 'مخلل', price: 10, has_sizes: false, sizes: [] },
      { id: 1109, name: 'بابا غنوج', price: 15, has_sizes: false, sizes: [] },
      { id: 1110, name: 'عيش', price: 10, has_sizes: false, sizes: [] },
      { id: 1111, name: 'باكت بطاطس سادة', price: 30, has_sizes: false, sizes: [] },
      { id: 1112, name: 'باكت بطاطس بصوص جبنة', price: 50, has_sizes: false, sizes: [] },
    ]
  },
];

export default menuData;
