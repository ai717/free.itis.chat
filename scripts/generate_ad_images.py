import os
from PIL import Image, ImageDraw, ImageFont

def draw_arrow(draw, x, y, size=16, color=(255, 255, 255)):
    half = size // 2
    draw.line([(x, y), (x + size, y)], fill=color, width=3)
    draw.line([(x + size - half, y - half), (x + size, y)], fill=color, width=3)
    draw.line([(x + size - half, y + half), (x + size, y)], fill=color, width=3)

def draw_checkmark(draw, x, y, size=14, color=(52, 211, 153)):
    p1 = (x, y + int(size * 0.55))
    p2 = (x + int(size * 0.38), y + int(size * 0.9))
    p3 = (x + size, y + int(size * 0.15))
    draw.line([p1, p2], fill=color, width=2)
    draw.line([p2, p3], fill=color, width=2)

def create_horizontal_banner():
    src_path = r"C:\Users\everg\.gemini\antigravity\brain\13b83125-d834-4785-b4f7-6afa9177c6a5\itis_free_promo_banner_1793895384878.jpg"
    im = Image.open(src_path).convert("RGBA")
    W, H = im.size # 1376, 768

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 1. Mask top English text completely with solid tech background, then smooth fade
    solid_h = 160
    fade_h = 240
    draw.rectangle([0, 0, W, solid_h], fill=(7, 10, 16, 255))
    for y in range(solid_h, fade_h):
        factor = 1.0 - ((y - solid_h) / (fade_h - solid_h)) ** 1.2
        alpha = int(255 * factor)
        draw.line([(0, y), (W, y)], fill=(7, 10, 16, alpha))

    # Mask bottom slightly for CTA bar
    bottom_h = 160
    for y in range(H - bottom_h, H):
        factor = ((y - (H - bottom_h)) / bottom_h) ** 1.3
        alpha = int(245 * factor)
        draw.line([(0, y), (W, y)], fill=(7, 10, 16, alpha))

    im = Image.alpha_composite(im, overlay)
    draw = ImageDraw.Draw(im)

    font_bold = "C:/Windows/Fonts/msyhbd.ttc"
    font_reg = "C:/Windows/Fonts/msyh.ttc"
    font_segoe = "C:/Windows/Fonts/segoeuib.ttf"

    f_title = ImageFont.truetype(font_bold, 54)
    f_badge = ImageFont.truetype(font_bold, 22)
    f_sub = ImageFont.truetype(font_reg, 24)
    f_cta = ImageFont.truetype(font_bold, 28)
    f_segoe_cta = ImageFont.truetype(font_segoe, 28)
    f_tag = ImageFont.truetype(font_reg, 20)

    # Top Pill Badge
    badge_text = "★ 全网精选 16,000+ 免费数字宝藏 ★"
    bbox = draw.textbbox((0, 0), badge_text, font=f_badge)
    bw = bbox[2] - bbox[0]
    bx = (W - bw) // 2
    by = 36
    pad_x, pad_y = 24, 8
    draw.rounded_rectangle([bx - pad_x, by - pad_y, bx + bw + pad_x, by + (bbox[3] - bbox[1]) + pad_y],
                           radius=18, fill=(13, 27, 45, 240), outline=(56, 189, 248, 220), width=2)
    draw.text((bx, by), badge_text, fill=(56, 189, 248), font=f_badge)

    # Title: "ITIS Free" + "开源 · 白嫖 · 避坑"
    t1 = "ITIS Free"
    t2 = "开源 · 白嫖 · 避坑"
    bbox1 = draw.textbbox((0, 0), t1, font=f_title)
    bbox2 = draw.textbbox((0, 0), t2, font=f_title)
    dot = "·"
    bbox_dot = draw.textbbox((0, 0), dot, font=f_title)

    total_w = (bbox1[2] - bbox1[0]) + 24 + (bbox_dot[2] - bbox_dot[0]) + 24 + (bbox2[2] - bbox2[0])
    tx = (W - total_w) // 2
    ty = 88

    # Title glow
    for off in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        draw.text((tx + off[0], ty + off[1]), t1, fill=(6, 182, 212, 100), font=f_title)
    draw.text((tx, ty), t1, fill=(255, 255, 255), font=f_title)

    curr_x = tx + (bbox1[2] - bbox1[0]) + 24
    draw.text((curr_x, ty), dot, fill=(100, 116, 139), font=f_title)
    curr_x += (bbox_dot[2] - bbox_dot[0]) + 24

    draw.text((curr_x, ty), t2, fill=(52, 211, 153), font=f_title)

    # Subtitle
    sub = "干净、无广告、社区驱动的中文数字资源导航 · 覆盖 23 大核心分类"
    bbox_sub = draw.textbbox((0, 0), sub, font=f_sub)
    sx = (W - (bbox_sub[2] - bbox_sub[0])) // 2
    draw.text((sx, 160), sub, fill=(203, 213, 225), font=f_sub)

    # Bottom CTA Box
    cta_w = 480
    cta_h = 60
    cx = (W - cta_w) // 2
    cy = H - 110

    # Gradient CTA button (cyan to blue)
    draw.rounded_rectangle([cx, cy, cx + cta_w, cy + cta_h], radius=30, fill=(14, 165, 233, 255), outline=(255, 255, 255, 200), width=2)
    cta_left = "立即免费探索"
    cta_url = "free.itis.chat"
    bbox_cl = draw.textbbox((0, 0), cta_left, font=f_cta)
    bbox_cu = draw.textbbox((0, 0), cta_url, font=f_segoe_cta)
    w_cl = bbox_cl[2] - bbox_cl[0]
    w_cu = bbox_cu[2] - bbox_cu[0]
    arrow_gap = 26
    inner_w = w_cl + arrow_gap + 20 + w_cu
    start_x = cx + (cta_w - inner_w) // 2
    
    draw.text((start_x, cy + 13), cta_left, fill=(255, 255, 255), font=f_cta)
    arrow_x = start_x + w_cl + 12
    arrow_y = cy + 30
    draw_arrow(draw, arrow_x, arrow_y, size=16, color=(255, 255, 255))
    draw.text((arrow_x + 24, cy + 13), cta_url, fill=(255, 255, 255), font=f_segoe_cta)

    # Badges below CTA using vector checkmarks
    features = ["零商业广告", "恶意站点预警", "开源工具首选", "永久免费"]
    feat_segs = []
    total_fw = 0
    check_size = 14
    for text in features:
        bw_text = draw.textbbox((0, 0), text, font=f_tag)
        w_txt = bw_text[2] - bw_text[0]
        feat_segs.append((w_txt, text))
        total_fw += check_size + 8 + w_txt + 36
    total_fw -= 36

    fx = (W - total_fw) // 2
    fy = H - 38
    for w_txt, text in feat_segs:
        draw_checkmark(draw, fx, fy + 4, size=check_size, color=(52, 211, 153))
        draw.text((fx + check_size + 8, fy), text, fill=(148, 163, 184), font=f_tag)
        fx += check_size + 8 + w_txt + 36

    output_path = r"G:\work\code\website\ITIS Free\public\popup-banner.png"
    im.convert("RGB").save(output_path, quality=95)
    print(f"Created: {output_path}")

def create_vertical_card():
    W, H = 720, 960
    card = Image.new("RGBA", (W, H), (10, 14, 23, 255))
    draw = ImageDraw.Draw(card)

    # Ambient glow
    for r in range(380, 0, -6):
        alpha = int(45 * (1 - r / 380))
        draw.ellipse([W//2 - r, 280 - r, W//2 + r, 280 + r], fill=(14, 165, 233, alpha))

    # Hero chest image
    src_path = r"C:\Users\everg\.gemini\antigravity\brain\13b83125-d834-4785-b4f7-6afa9177c6a5\itis_free_promo_banner_1793895384878.jpg"
    raw_hero = Image.open(src_path).convert("RGBA")
    chest_crop = raw_hero.crop((320, 180, 1056, 740))
    chest_w = W - 40
    chest_h = int(chest_crop.height * (chest_w / chest_crop.width))
    chest_crop = chest_crop.resize((chest_w, chest_h), Image.Resampling.LANCZOS)

    mask = Image.new("L", (chest_w, chest_h), 255)
    mask_draw = ImageDraw.Draw(mask)
    fade_start = chest_h - 130
    for y in range(fade_start, chest_h):
        val = int(255 * (1.0 - (y - fade_start) / (chest_h - fade_start)))
        mask_draw.line([(0, y), (chest_w, y)], fill=val)

    card.paste(chest_crop, (20, 20), mask)

    # Card outline border
    draw.rounded_rectangle([2, 2, W - 3, H - 3], radius=32, outline=(56, 189, 248, 140), width=2)

    font_bold = "C:/Windows/Fonts/msyhbd.ttc"
    font_reg = "C:/Windows/Fonts/msyh.ttc"
    font_segoe = "C:/Windows/Fonts/segoeuib.ttf"

    f_badge = ImageFont.truetype(font_bold, 20)
    f_title = ImageFont.truetype(font_bold, 44)
    f_tagline = ImageFont.truetype(font_bold, 24)
    f_chip = ImageFont.truetype(font_bold, 18)
    f_item_t = ImageFont.truetype(font_bold, 22)
    f_item_d = ImageFont.truetype(font_reg, 17)
    f_btn = ImageFont.truetype(font_bold, 26)
    f_segoe_btn = ImageFont.truetype(font_segoe, 26)
    f_foot = ImageFont.truetype(font_reg, 16)

    # Top Tag
    tag_t = "★ 互联网极客免费数字宝藏 ★"
    bbox = draw.textbbox((0, 0), tag_t, font=f_badge)
    tw = bbox[2] - bbox[0]
    tx = (W - tw) // 2
    draw.rounded_rectangle([tx - 18, 38, tx + tw + 18, 76], radius=18, fill=(15, 23, 42, 240), outline=(56, 189, 248, 220), width=1)
    draw.text((tx, 44), tag_t, fill=(56, 189, 248), font=f_badge)

    content_y = 465

    # Title: ITIS Free
    title_t = "ITIS Free · 开源 · 白嫖 · 避坑"
    bbox_t = draw.textbbox((0, 0), title_t, font=f_title)
    draw.text(((W - (bbox_t[2] - bbox_t[0])) // 2, content_y), title_t, fill=(255, 255, 255), font=f_title)

    # Subtitle
    sub_t = "收录 16,000+ 免费工具 · 覆盖 23 大核心分类"
    bbox_s = draw.textbbox((0, 0), sub_t, font=f_tagline)
    draw.text(((W - (bbox_s[2] - bbox_s[0])) // 2, content_y + 58), sub_t, fill=(52, 211, 153), font=f_tagline)

    # 3 Feature items with chip badges
    items = [
        ("纯净避坑", (14, 165, 233), "零广告 · 恶意站点实时预警", "彻底远离虚假诱导与套路充值，内置全网风险黑名单与避坑提示"),
        ("全网收录", (16, 185, 129), "23 大核心分类全覆盖", "AI工具、影视动漫、游戏MOD、系统软件、电子书、自建利器"),
        ("开源首选", (139, 92, 246), "开源优先 · 社区驱动", "全球极客精选验证，永久免费白嫖，提供一键直达与官方镜像")
    ]

    item_y = content_y + 115
    for chip_txt, chip_color, title, desc in items:
        # Box
        draw.rounded_rectangle([42, item_y, W - 42, item_y + 72], radius=16, fill=(17, 24, 39, 230), outline=(31, 41, 55, 200), width=1)
        
        # Chip
        c_bbox = draw.textbbox((0, 0), chip_txt, font=f_chip)
        cw = c_bbox[2] - c_bbox[0]
        draw.rounded_rectangle([58, item_y + 12, 58 + cw + 16, item_y + 36], radius=6, fill=(chip_color[0]//4, chip_color[1]//4, chip_color[2]//4), outline=chip_color, width=1)
        draw.text((66, item_y + 13), chip_txt, fill=chip_color, font=f_chip)

        # Title
        draw.text((58 + cw + 28, item_y + 11), title, fill=(241, 245, 249), font=f_item_t)
        # Description
        draw.text((60, item_y + 42), desc, fill=(148, 163, 184), font=f_item_d)
        item_y += 84

    # Big CTA Button
    btn_w = W - 84
    btn_h = 66
    bx = 42
    by = H - 124
    draw.rounded_rectangle([bx, by, bx + btn_w, by + btn_h], radius=33, fill=(14, 165, 233), outline=(255, 255, 255, 180), width=2)
    
    btn_left = "立即开启宝藏"
    btn_url = "free.itis.chat"
    bw_l = draw.textbbox((0, 0), btn_left, font=f_btn)
    bw_u = draw.textbbox((0, 0), btn_url, font=f_segoe_btn)
    wl = bw_l[2] - bw_l[0]
    wu = bw_u[2] - bw_u[0]
    total_bw = wl + 18 + 20 + wu
    start_bx = bx + (btn_w - total_bw) // 2

    draw.text((start_bx, by + 17), btn_left, fill=(255, 255, 255), font=f_btn)
    arrow_bx = start_bx + wl + 10
    arrow_by = by + 34
    draw_arrow(draw, arrow_bx, arrow_by, size=16, color=(255, 255, 255))
    draw.text((arrow_bx + 26, by + 17), btn_url, fill=(255, 255, 255), font=f_segoe_btn)

    # Footer
    foot_t = "免登录 · 无套路 · 纯净导航 · 建议按 Ctrl+D 收藏"
    bbox_f = draw.textbbox((0, 0), foot_t, font=f_foot)
    draw.text(((W - (bbox_f[2] - bbox_f[0])) // 2, H - 42), foot_t, fill=(100, 116, 139), font=f_foot)

    output_path = r"G:\work\code\website\ITIS Free\public\popup-card.png"
    card.convert("RGB").save(output_path, quality=95)
    print(f"Created: {output_path}")

if __name__ == "__main__":
    create_horizontal_banner()
    create_vertical_card()
