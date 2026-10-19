#!/usr/bin/env python3
"""
MOMO CLUB - QR Code Generator Script
يقوم هذا السكريبت بإنشاء باركود QR Code عالي الدقة للمنيو الإلكتروني
مع تصميم كارت فخم قابل للطباعة على طاولات المطعم
"""

import sys
import os
import qrcode
from PIL import Image, ImageDraw, ImageFont

def generate_qr(target_url="https://momo-club.vercel.app", output_dir="qr_codes"):
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. إنشاء QR Code عالي الجودة
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=2,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    # ألوان فاخرة تماشي هوية المطعم (أخضر زمردي داكن + خلفية بيضاء نقية لسهولة المسح)
    qr_img = qr.make_image(fill_color="#125A2C", back_color="white").convert('RGB')
    raw_qr_path = os.path.join(output_dir, "momo_menu_qr.png")
    qr_img.save(raw_qr_path)
    print(f"✅ تم إنشاء الباركود المباشر: {raw_qr_path}")

    # 2. إنشاء كارت طاولة فخم للطباعة (Table Tent Card / Flyer)
    # الحجم 1200x1600 بكسل عالي الدقة للطباعة
    card_w, card_h = 1000, 1400
    card = Image.new('RGB', (card_w, card_h), color="#0A0A0F")
    draw = ImageDraw.Draw(card)

    # إطار خارجي ذهبي متدرج/أنيق
    draw.rectangle([20, 20, card_w - 20, card_h - 20], outline="#F4A62A", width=4)
    draw.rectangle([30, 30, card_w - 30, card_h - 30], outline="#27A854", width=2)

    # مستطيل أبيض في المنتصف للـ QR Code
    qr_size = 560
    qr_resized = qr_img.resize((qr_size, qr_size), Image.Resampling.LANCZOS)
    qr_bg_x = (card_w - qr_size - 40) // 2
    qr_bg_y = 440
    draw.rounded_rectangle(
        [qr_bg_x, qr_bg_y, qr_bg_x + qr_size + 40, qr_bg_y + qr_size + 40],
        radius=25,
        fill="white",
        outline="#F4A62A",
        width=4
    )
    card.paste(qr_resized, (qr_bg_x + 20, qr_bg_y + 20))

    printable_card_path = os.path.join(output_dir, "momo_table_qr_card.png")
    card.save(printable_card_path)
    print(f"✅ تم إنشاء كارت الطاولة الجاهز للطباعة: {printable_card_path}")

    return raw_qr_path, printable_card_path

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://momo-club.vercel.app"
    print(f"🚀 جاري إنشاء باركود QR للرابط: {url}")
    generate_qr(url)
